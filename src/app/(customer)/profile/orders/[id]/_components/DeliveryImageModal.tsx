"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface DeliveryImageModalProps {
  isOpen: boolean;
  imageUrl?: string | null;
  onClose: () => void;
}

export default function DeliveryImageModal({
  isOpen,
  imageUrl,
  onClose,
}: DeliveryImageModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen || !imageUrl) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-5 text-left align-middle shadow-2xl transition-all animate-in fade-in zoom-in duration-200 border border-gray-200/80 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <span className="material-symbols-outlined text-green-600 text-xl">verified</span>
            <span>Delivery Image</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="overflow-auto flex items-center justify-center max-h-[75vh] py-2">
          <img
            src={imageUrl}
            alt="Proof of Delivery Full"
            className="max-h-[70vh] w-auto object-contain rounded-xl shadow-xs"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
