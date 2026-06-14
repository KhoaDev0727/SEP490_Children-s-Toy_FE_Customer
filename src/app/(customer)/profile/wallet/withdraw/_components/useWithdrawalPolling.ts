"use client";

import { useEffect, useRef, useState } from "react";
import { withdrawalApi } from "@/features/withdrawal/services/withdrawal-api";
import type { WithdrawalDto, WithdrawalStatus } from "@/features/withdrawal/types/withdrawal";

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_DURATION_MS = 120_000; // 2 minutes

interface UseWithdrawalPollingResult {
  data: WithdrawalDto | null;
  isTimedOut: boolean;
  error: string | null;
}

export function useWithdrawalPolling(
  withdrawalId: number | null,
  onFinished: (status: WithdrawalStatus, data: WithdrawalDto) => void
): UseWithdrawalPollingResult {
  const [data, setData] = useState<WithdrawalDto | null>(null);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  useEffect(() => {
    if (!withdrawalId) return;

    let cancelled = false;
    const startedAt = Date.now();

    const fetchStatus = async (): Promise<boolean> => {
      try {
        const json = await withdrawalApi.getWithdrawal(withdrawalId);
        if (cancelled) return false;

        setData(json);
        setError(null);

        if (json.status === "SUCCESS" || json.status === "FAILED" || json.status === "CANCELLED") {
          onFinishedRef.current(json.status, json);
          return true;
        }

        if (Date.now() - startedAt > MAX_POLL_DURATION_MS) {
          setIsTimedOut(true);
          return true;
        }

        return false;
      } catch (err) {
        if (cancelled) return false;
        setError(err instanceof Error ? err.message : "Failed to check transaction status");
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

    void tick();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [withdrawalId]);

  return { data, isTimedOut, error };
}
