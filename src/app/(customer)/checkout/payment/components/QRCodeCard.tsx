"use client";

import { useEffect, useState } from "react";

const DEFAULT_EXPIRE_SECONDS = 5 * 60; // 5 phút

const normalizeExpiresAt = (expiresAt: string): string => {
  if (/Z$|[+-]\d{2}:?\d{2}$/.test(expiresAt)) return expiresAt;
  return `${expiresAt}Z`;
};

const getSecondsLeftFromExpiry = (expiresAt?: string | null): number | null => {
  if (!expiresAt) return null;
  const expiresAtMs = Date.parse(normalizeExpiresAt(expiresAt));
  if (Number.isNaN(expiresAtMs)) return null;
  const diffMs = expiresAtMs - Date.now();
  return Math.max(0, Math.floor(diffMs / 1000));
};

interface QRCodeCardProps {
  qrUrl: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  expiresAt?: string | null;
  isExpired?: boolean;
}

export default function QRCodeCard({
  qrUrl,
  onRefresh,
  isRefreshing,
  expiresAt,
  isExpired,
}: QRCodeCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(
    () => getSecondsLeftFromExpiry(expiresAt) ?? DEFAULT_EXPIRE_SECONDS,
  );
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const next = getSecondsLeftFromExpiry(expiresAt);
    if (next === null) return;
    setSecondsLeft(next);
    setExpired(next <= 0);
  }, [expiresAt]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      setExpired(true);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  const effectiveExpired = expired || Boolean(isExpired);
  const progress = secondsLeft / DEFAULT_EXPIRE_SECONDS;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const isUrgent = secondsLeft < 60;

  const handleRefresh = () => {
    onRefresh?.();
    if (!expiresAt) {
      setSecondsLeft(DEFAULT_EXPIRE_SECONDS);
      setExpired(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-white border border-gray-200/80 rounded-xl p-8 gap-6 w-full shadow-sm">
      {/* Title */}
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
          Pay with
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl font-black tracking-tight text-gray-900">
            QR code (VietQR)
          </span>
        </div>
      </div>

      {/* QR Frame */}
      <div className="relative p-2.5 bg-white border border-gray-200 rounded-xl">
        {/* Decorative corner accents */}
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-[#ff4f00] rounded-tl-md" />
        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-[#ff4f00] rounded-tr-md" />
        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-[#ff4f00] rounded-bl-md" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-[#ff4f00] rounded-br-md" />

        {/* Laser line scanner animation */}
        {!effectiveExpired && (
          <div className="absolute top-2 left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#ff4f00] to-transparent animate-pulse pointer-events-none z-10" />
        )}

        <div
          className={[
            "w-52 h-52 rounded-lg overflow-hidden transition-all duration-300 relative",
            effectiveExpired ? "opacity-25 blur-sm" : "opacity-100",
          ].join(" ")}
        >
          <img
            src={qrUrl}
            alt="QR thanh toan SePay"
            className="w-full h-full object-contain bg-white"
            loading="eager"
          />
        </div>

        {/* Expired overlay */}
        {effectiveExpired && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-xl z-20">
            <svg className="w-10 h-10 text-red-600 mb-2" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs font-black text-red-600 uppercase tracking-wider">Code expired</p>
          </div>
        )}
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0">
            <circle cx="22" cy="22" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="3" opacity="0.8" />
            <circle
              cx="22" cy="22" r={radius}
              fill="none"
              stroke={isUrgent ? "#dc2626" : "#ff4f00"}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 22 22)"
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
            />
          </svg>
          <div>
            <p className={[
              "text-2xl font-black tabular-nums leading-none",
              isUrgent ? "text-red-600" : "text-gray-900",
            ].join(" ")}>
              {minutes}:{seconds}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5 font-bold">
              Remaining
            </p>
          </div>
        </div>
      </div>

      {/* Scan hint */}
      <div className="flex items-center gap-2.5 bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5 w-full justify-center">
        <svg className="w-4 h-4 text-[#ff4f00] shrink-0" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3m2 0V6a2 2 0 012-2h2M5 8v2m14-2h2m-2 0V6a2 2 0 00-2-2h-2m2 2v2m-6-6v.01"
          />
        </svg>
        <p className="text-xs font-black text-[#ff4f00] tracking-tight">
          Scan VietQR to pay automatically
        </p>
      </div>

      {effectiveExpired && (
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full py-3.5 rounded-xl text-xs uppercase tracking-wider font-black bg-[#ff4f00] hover:bg-[#ff5f1a] disabled:bg-gray-300 text-white shadow-sm transition-all flex items-center justify-center gap-2"
        >
          {isRefreshing ? (
            <>
              <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Generating...
            </>
          ) : (
            "Generate new QR code"
          )}
        </button>
      )}
    </div>
  );
}
