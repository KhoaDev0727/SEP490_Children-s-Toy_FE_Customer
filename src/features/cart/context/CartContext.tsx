"use client";


import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "@/context/AuthContext";
import { cartApi } from "@/features/cart/services/cart-api";
import type { CartData, CartRealtimeEnvelope } from "@/features/cart/types/cart";


interface CartContextValue {
  cart: CartData | null;
  isLoading: boolean;
  isConnected: boolean;
  refreshCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}


const CartContext = createContext<CartContextValue | null>(null);


const normalizeHubBaseUrl = (url?: string): string => {
  const fallback = "http://localhost:5216";
  if (!url || !url.trim()) return fallback;


  const trimmed = url.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed.slice(0, -4) : trimmed;
};


const HUB_BASE_URL = normalizeHubBaseUrl(process.env.NEXT_PUBLIC_API_URL);
const HUB_URL = `${HUB_BASE_URL}/hubs/cart`;


const CART_EVENTS = [
  "CartUpdated",
  "CartItemAdded",
  "CartItemRemoved",
  "CartQuantityChanged",
  "CartPromotionChanged",
  "CartPriceChanged",
  "CartOutOfStock",
] as const;


const extractEnvelope = (payload: unknown): { cart: CartData | null; message?: string } => {
  if (!payload || typeof payload !== "object") {
    return { cart: null };
  }


  const record = payload as Record<string, unknown>;
  const message = typeof record.message === "string"
    ? record.message
    : typeof record.Message === "string"
      ? record.Message
      : undefined;


  const data = (record.data ?? record.Data) as CartData | null | undefined;
  return { cart: data ?? null, message };
};


export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuthContext();
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const realtimeRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRealtimeRefreshingRef = useRef(false);


  const refreshCartSnapshot = useCallback(async () => {
    if (!isAuthenticated) return;


    try {
      const response = await cartApi.getMyCart();
      setCart(response);
    } catch {
      // Ignore realtime refresh errors, normal API flows will still work.
    }
  }, [isAuthenticated]);


  const queueRealtimeRefresh = useCallback(() => {
    if (realtimeRefreshTimerRef.current) return;


    realtimeRefreshTimerRef.current = setTimeout(async () => {
      realtimeRefreshTimerRef.current = null;
      if (isRealtimeRefreshingRef.current) return;


      isRealtimeRefreshingRef.current = true;
      try {
        await refreshCartSnapshot();
      } finally {
        isRealtimeRefreshingRef.current = false;
      }
    }, 120);
  }, [refreshCartSnapshot]);


  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setIsLoading(false);
      return;
    }


    setIsLoading(true);
    try {
      const response = await cartApi.getMyCart();
      setCart(response);
    } catch {
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);


  useEffect(() => {
    if (!isHydrated) return;
    void refreshCart();
  }, [isHydrated, refreshCart]);


  useEffect(() => {
    if (!isHydrated || !isAuthenticated) {
      setIsConnected(false);
      return;
    }


    let mounted = true;
    let hubConnection: import("@microsoft/signalr").HubConnection | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;


    const handleEvent = (eventName: string) => (payload: CartRealtimeEnvelope | unknown) => {
      if (!mounted) return;
      if (process.env.NODE_ENV === "development") {
        console.info("[CartSignalR] event received", eventName, payload);
      }


      const { cart: nextCart, message } = extractEnvelope(payload);
      if (nextCart) {
        setCart(nextCart);
      }


      queueRealtimeRefresh();


      if (eventName === "CartOutOfStock") {
        toast.error(message || "Some items are out of stock.");
      }
    };


    const scheduleRetry = () => {
      if (!mounted || retryTimer) return;
      retryTimer = setTimeout(() => {
        retryTimer = null;
        void connect();
      }, 2000);
    };


    const connect = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsConnected(false);
        scheduleRetry();
        return;
      }


      const signalr = await import("@microsoft/signalr");
      if (!mounted) return;
      const candidateUrls = new Set<string>([HUB_URL]);
      if (typeof window !== "undefined" && window.location.protocol === "https:" && HUB_URL.startsWith("http://")) {
        candidateUrls.add(HUB_URL.replace("http://", "https://").replace(":5216", ":7083"));
      }


      let lastError: unknown = null;
      for (const url of candidateUrls) {
        const connection = new signalr.HubConnectionBuilder()
          .withUrl(url, {
            accessTokenFactory: () => localStorage.getItem("access_token") ?? "",
            withCredentials: true,
          })
          .withAutomaticReconnect()
          .build();


        CART_EVENTS.forEach((eventName) => {
          connection.on(eventName, handleEvent(eventName));
        });


        connection.onreconnected(async () => {
          if (!mounted) return;
          setIsConnected(true);
          await refreshCart();
        });


        connection.onclose(() => {
          if (!mounted) return;
          setIsConnected(false);
          scheduleRetry();
        });


        try {
          await connection.start();
          if (!mounted) {
            await connection.stop();
            return;
          }


          hubConnection = connection;
          setIsConnected(true);
          if (process.env.NODE_ENV === "development") {
            console.info("[CartSignalR] connected", url);
          }
          return;
        } catch (error: unknown) {
          lastError = error;
          if (process.env.NODE_ENV === "development") {
            const errorDetails = error as {
              message?: string;
              statusCode?: number;
              stack?: string;
            };
            console.error(`[CartSignalR] Connection failed to ${url}:`, {
              message: errorDetails.message,
              statusCode: errorDetails.statusCode,
              stack: errorDetails.stack
            });
          }
          await connection.stop();
        }
      }


      setIsConnected(false);
      if (lastError) {
        console.warn("[CartSignalR] Unable to connect to cart hub", lastError);
      }
      scheduleRetry();
    };


    void connect().catch((error) => {
      setIsConnected(false);
      console.warn("[CartSignalR] init failed", error);
      scheduleRetry();
    });


    return () => {
      mounted = false;
      setIsConnected(false);
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      if (realtimeRefreshTimerRef.current) {
        clearTimeout(realtimeRefreshTimerRef.current);
        realtimeRefreshTimerRef.current = null;
      }
      if (hubConnection) {
        void hubConnection.stop();
      }
    };
  }, [isAuthenticated, isHydrated, queueRealtimeRefresh, refreshCart]);


  const addItem = useCallback(async (productId: number, quantity = 1) => {
    const response = await cartApi.addItem({ productId, quantity });
    setCart(response);
  }, []);


  const updateQuantity = useCallback(async (cartItemId: number, quantity: number) => {
    const response = await cartApi.updateQuantity(cartItemId, { quantity });
    setCart(response);
  }, []);


  const removeItem = useCallback(async (cartItemId: number) => {
    const response = await cartApi.removeItem(cartItemId);
    setCart(response);
  }, []);


  const clearCart = useCallback(async () => {
    const response = await cartApi.clearCart();
    setCart(response);
  }, []);


  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isLoading,
      isConnected,
      refreshCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [cart, isLoading, isConnected, refreshCart, addItem, updateQuantity, removeItem, clearCart],
  );


  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}


export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }


  return context;
}



