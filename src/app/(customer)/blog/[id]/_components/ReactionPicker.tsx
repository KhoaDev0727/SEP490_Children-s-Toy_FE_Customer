"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ReactionCode = "like" | "love" | "haha";

interface ReactionPickerProps {
  currentReaction?: string | null;
  likeCount: number;
  loveCount: number;
  hahaCount: number;
  disabled?: boolean;
  onSelect: (reactionCode: ReactionCode) => void;
  className?: string;
}

const REACTIONS: Array<{ code: ReactionCode; label: string; icon: string }> = [
  { code: "like", label: "Like", icon: "\u{1F44D}" },
  { code: "love", label: "Love", icon: "\u{2764}\u{FE0F}" },
  { code: "haha", label: "Haha", icon: "\u{1F602}" },
];

const getReactionMeta = (reactionCode: string | null | undefined) =>
  REACTIONS.find((item) => item.code === (reactionCode ?? "").toLowerCase()) ?? REACTIONS[0];

export default function ReactionPicker({
  currentReaction,
  likeCount,
  loveCount,
  hahaCount,
  disabled = false,
  onSelect,
  className = "",
}: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const longPressTimerRef = useRef<number | null>(null);

  const active = getReactionMeta(currentReaction);
  const totalCount = likeCount + loveCount + hahaCount;

  const activeTextColor = useMemo(() => {
    if (!currentReaction) return "text-[#7f4a2a]";
    if (active.code === "love") return "text-[#d84b86]";
    if (active.code === "haha") return "text-[#c27d00]";
    return "text-[#1d6fd6]";
  }, [active.code, currentReaction]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
    };
  }, []);

  const openNow = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    setIsOpen(true);
  };

  const closeLater = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setIsOpen(false), 120);
  };

  const startLongPress = () => {
    if (disabled) return;
    if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = window.setTimeout(() => setIsOpen(true), 280);
  };

  const clearLongPress = () => {
    if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={openNow}
      onMouseLeave={closeLater}
      onTouchStart={startLongPress}
      onTouchEnd={clearLongPress}
      onTouchCancel={clearLongPress}
    >
      {isOpen && (
        <div className="absolute bottom-[calc(100%+8px)] left-0 z-20 rounded-full border border-[#efdfd4] bg-white px-2 py-1 shadow-[0_12px_32px_rgba(38,24,18,0.14)]">
          <div className="flex items-center gap-1">
            {REACTIONS.map((item) => (
              <button
                key={item.code}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onSelect(item.code);
                  setIsOpen(false);
                }}
                className="group relative h-9 w-9 rounded-full text-xl transition duration-200 hover:-translate-y-1 hover:scale-125 disabled:opacity-50"
                aria-label={item.label}
                title={item.label}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect("like")}
        className={`inline-flex items-center gap-1.5 rounded-full border border-[#f1ddd2] bg-white px-3 py-1.5 text-xs font-semibold transition hover:border-[#c2410c] disabled:opacity-50 ${activeTextColor}`}
      >
        <span className="text-sm leading-none">{active.icon}</span>
        <span className="text-[#8e7164]">{totalCount}</span>
      </button>
    </div>
  );
}

