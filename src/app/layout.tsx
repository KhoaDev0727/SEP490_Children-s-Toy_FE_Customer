import type { Metadata } from "next";
import "./globals.css";
import "quill/dist/quill.snow.css";
import { AuthProvider } from "@/context/AuthContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { CartProvider } from "@/features/cart/context/CartContext";
import { Toaster } from "react-hot-toast";
import { NotificationRealtimeProvider } from "@/features/notifications/context/NotificationRealtimeContext";
import TrackingBootstrapper from "@/components/shared/TrackingBootstrapper";

export const metadata: Metadata = {
  title: "ToyStore - High-Quality Children's Toys",
  description: "High-quality children's toy store, safe and creative",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="only light" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', sans-serif" }} suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <ThemeProvider>
              <NotificationRealtimeProvider>
                <SidebarProvider>
                  <TrackingBootstrapper />
                  {children}
                  <Toaster
                    position="top-right"
                    containerStyle={{ zIndex: 9999999 }}
                    toastOptions={{
                      style: {
                        zIndex: 9999999,
                      },
                    }}
                  />
                </SidebarProvider>
              </NotificationRealtimeProvider>
            </ThemeProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
