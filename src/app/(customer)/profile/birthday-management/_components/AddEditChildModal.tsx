"use client";

import { useEffect, useState } from "react";
import { Child, CreateChildPayload, UpdateChildPayload } from "@/features/profile/types/children";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateChildPayload | UpdateChildPayload) => Promise<void>;
  editTarget?: Child | null;
};

export default function AddEditChildModal({ isOpen, onClose, onSave, editTarget }: Props) {
  const [fullName, setFullName] = useState("");
  const [nickName, setNickName] = useState("");
  const [dob, setDob] = useState("");
  const [sexId, setSexId] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date();
  const maxDob = today.toISOString().split("T")[0];
  const minDob = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate())
    .toISOString()
    .split("T")[0];

  useEffect(() => {
    if (isOpen) {
      if (editTarget) {
        setFullName(editTarget.fullName);
        setNickName(editTarget.nickName || "");
        // Format ISO date to YYYY-MM-DD for input type="date"
        setDob(editTarget.dob ? editTarget.dob.split("T")[0] : "");
        setSexId(editTarget.sexId || 1);
      } else {
        setFullName("");
        setNickName("");
        setDob("");
        setSexId(1);
      }
    }
  }, [editTarget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !dob.trim()) return;

    setIsSubmitting(true);
    try {
      // Ensure we send the date correctly without timezone shifts
      // backend expects DateTime, so we can send YYYY-MM-DDT00:00:00Z
      const isoDob = `${dob}T00:00:00Z`;

      await onSave({
        fullName: fullName.trim(),
        nickName: nickName.trim() || null,
        dob: isoDob,
        sexId
      });
      onClose();
    } catch (error) {
      console.error("Failed to save child:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] border border-gray-200/80 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Subtle decorative gradient background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#ff4f00]/5 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between relative bg-white/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
              {editTarget ? "Edit Child Info" : "Add New Child"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 bg-gray-50/50 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form id="child-form" onSubmit={handleSubmit} className="px-6 py-6 space-y-5 bg-white">
          <div className="space-y-1.5">
            <label htmlFor="input-fullName" className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 ml-1">
              Full Name
            </label>
            <input
              id="input-fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#ff4f00] focus:ring-1 focus:ring-[#ff4f00] text-gray-900 text-sm p-4 outline-none transition-all duration-300 placeholder:text-gray-400 font-medium disabled:opacity-60 disabled:bg-gray-100/50 disabled:cursor-not-allowed disabled:text-gray-600"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="input-nickName" className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 ml-1">
              Nickname <span className="text-gray-400 font-normal lowercase tracking-normal">(Optional)</span>
            </label>
            <input
              id="input-nickName"
              type="text"
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
              placeholder="e.g. Junior, Sunny..."
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#ff4f00] focus:ring-1 focus:ring-[#ff4f00] text-gray-900 text-sm p-4 outline-none transition-all duration-300 placeholder:text-gray-400 font-medium disabled:opacity-60 disabled:bg-gray-100/50 disabled:cursor-not-allowed disabled:text-gray-600"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="input-dob" className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 ml-1">
              Date of Birth
            </label>
            <input
              id="input-dob"
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              disabled={isSubmitting}
              min={minDob}
              max={maxDob}
              className="w-full rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#ff4f00] focus:ring-1 focus:ring-[#ff4f00] text-gray-900 text-sm p-4 outline-none transition-all duration-300 placeholder:text-gray-400 font-medium disabled:opacity-60 disabled:bg-gray-100/50 disabled:cursor-not-allowed disabled:text-gray-600"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 ml-1">
              Gender
            </label>
            <div className="flex gap-3">
              {[
                { id: 1, label: "Male", icon: "👦" },
                { id: 2, label: "Female", icon: "👧" },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSexId(g.id)}
                  disabled={isSubmitting}
                  className={`flex-1 py-4 rounded-xl text-sm font-semibold border-2 transition-all duration-300 ${sexId === g.id
                    ? "border-[#ff4f00] bg-[#ff4f00]/5 text-[#ff4f00] shadow-sm"
                    : "bg-white text-gray-900 border-gray-200 hover:border-gray-400 hover:shadow-sm"
                    } disabled:opacity-50`}
                >
                  <span className="mr-2 text-xl">{g.icon}</span>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-5 bg-white border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="child-form"
            disabled={isSubmitting}
            className="px-8 py-3 bg-[#ff4f00] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#ff5f1a] transition-all flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50 shadow-sm"
          >
            {isSubmitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {editTarget ? "Save" : "Add Child"}
          </button>
        </div>
      </div>
    </div>
  );
}
