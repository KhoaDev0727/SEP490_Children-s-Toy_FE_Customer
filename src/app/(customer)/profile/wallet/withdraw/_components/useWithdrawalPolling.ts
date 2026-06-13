"use client";

import { useEffect, useRef, useState } from "react";
import type { WithdrawalDetail, WithdrawalStatus } from "./types";

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_DURATION_MS = 120000; // 2 minutes

interface UseWithdrawalPollingResult {
  data: WithdrawalDetail | null;
  isTimedOut: boolean;
  error: string | null;
}

export function useWithdrawalPolling(
  withdrawalId: string,
  onFinished: (status: WithdrawalStatus, data: WithdrawalDetail) => void
): UseWithdrawalPollingResult {
  const [data, setData] = useState<WithdrawalDetail | null>(null);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep latest callback without re-triggering effect
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  useEffect(() => {
    if (!withdrawalId) return;

    let cancelled = false;
    const startedAt = Date.now();

    const fetchStatus = async () => {
      try {
        const queryParams = typeof window !== "undefined" ? window.location.search : "";
        const cacheBuster = `_t=${Date.now()}`;
        const separator = queryParams ? "&" : "?";
        const res = await fetch(`/api/withdrawals/${withdrawalId}${queryParams}${separator}${cacheBuster}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const json: WithdrawalDetail = await res.json();
        if (cancelled) return;

        setData(json);
        setError(null);

        if (json.status === "SUCCESS" || json.status === "FAILED") {
          onFinishedRef.current(json.status, json);
          return true; // Stop polling
        }

        if (Date.now() - startedAt > MAX_POLL_DURATION_MS) {
          setIsTimedOut(true);
          return true; // Stop polling
        }

        return false;
      } catch (err) {
        if (cancelled) return false;
        setError(
          err instanceof Error ? err.message : "An error occurred while fetching withdrawal status"
        );
        return false;
      }
    };

    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = async () => {
      const shouldStop = await fetchStatus();
      if (!shouldStop && !cancelled) {
        timeoutId = setTimeout(tick, POLL_INTERVAL_MS);
      }
    };

    // First execution immediately, then tick
    void tick();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [withdrawalId]);

  return { data, isTimedOut, error };
}
