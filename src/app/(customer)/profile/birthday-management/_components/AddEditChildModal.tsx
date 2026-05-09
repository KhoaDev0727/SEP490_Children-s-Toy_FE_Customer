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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#e2bfb0]/30 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e2bfb0]/20 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ffdbcc] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#a14000] text-xl">
                {editTarget ? "edit" : "child_care"}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#261812]">
              {editTarget ? "Edit Child Info" : "Add New Child"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5a4136] hover:bg-[#fff1eb] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form id="child-form" onSubmit={handleSubmit} className="px-6 py-6 space-y-5 bg-white">
          <div className="space-y-1.5">
            <label htmlFor="input-fullName" className="block text-[10px] font-bold uppercase tracking-widest text-[#565e74]">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="input-fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-lg border border-[#e2bfb0] bg-[#fff8f6] text-sm text-[#261812] outline-none focus:ring-2 focus:ring-[#ff6a00]/40 focus:border-[#ff6a00] transition-all disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="input-nickName" className="block text-[10px] font-bold uppercase tracking-widest text-[#565e74]">
              Nickname
            </label>
            <input
              id="input-nickName"
              type="text"
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
              placeholder="e.g. Junior, Sunny..."
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-lg border border-[#e2bfb0] bg-[#fff8f6] text-sm text-[#261812] outline-none focus:ring-2 focus:ring-[#ff6a00]/40 focus:border-[#ff6a00] transition-all disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="input-dob" className="block text-[10px] font-bold uppercase tracking-widest text-[#565e74]">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              id="input-dob"
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              disabled={isSubmitting}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 rounded-lg border border-[#e2bfb0] bg-[#fff8f6] text-sm text-[#261812] outline-none focus:ring-2 focus:ring-[#ff6a00]/40 focus:border-[#ff6a00] transition-all disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#565e74]">
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
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                    sexId === g.id
                      ? "bg-[#ff6a00] text-white border-[#ff6a00] shadow-sm"
                      : "bg-white text-[#5a4136] border-[#e2bfb0] hover:border-[#ff6a00] hover:text-[#ff6a00]"
                  } disabled:opacity-50`}
                >
                  <span className="mr-1">{g.icon}</span>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#fff8f6] border-t border-[#e2bfb0]/20 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-full text-sm font-semibold text-[#5a4136] hover:bg-[#fff1eb] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="child-form"
            disabled={isSubmitting}
            className="px-8 py-2 bg-[#ff6a00] text-white rounded-full text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-50"
          >
            {isSubmitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {editTarget ? "Save Changes" : "Add Child"}
          </button>
        </div>
      </div>
    </div>
  );
}
