"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ALLOWED_SEX_OPTIONS,
  FULL_NAME_MAX_LENGTH,
  FULL_NAME_MIN_LENGTH,
  getChildDobBounds,
  MAX_CHILD_AGE_YEARS,
  NICK_NAME_MAX_LENGTH,
} from "@/features/profile/constants/children.constants";
import {
  ChildFormValues,
  validateChildForm,
} from "@/features/profile/types/children.schema";
import { Child, CreateChildPayload, UpdateChildPayload } from "@/features/profile/types/children";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateChildPayload | UpdateChildPayload) => Promise<void>;
  editTarget?: Child | null;
};

type FieldErrors = Partial<Record<keyof ChildFormValues, string>>;

export default function AddEditChildModal({ isOpen, onClose, onSave, editTarget }: Props) {
  const [fullName, setFullName] = useState("");
  const [nickName, setNickName] = useState("");
  const [dob, setDob] = useState("");
  const [sexId, setSexId] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { minDob, maxDob } = getChildDobBounds();

  useEffect(() => {
    if (isOpen) {
      setFieldErrors({});
      if (editTarget) {
        setFullName(editTarget.fullName);
        setNickName(editTarget.nickName || "");
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

  if (!isOpen) return null;

  const clearFieldError = (field: keyof ChildFormValues) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateChildForm(
      { fullName, nickName, dob, sexId },
      Boolean(editTarget),
    );

    if (!validation.success) {
      setFieldErrors(validation.fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const isoDob = `${dob}T00:00:00Z`;

      await onSave({
        fullName: fullName.trim(),
        nickName: nickName.trim() || null,
        dob: isoDob,
        sexId,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save child:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputErrorClass = (field: keyof ChildFormValues) =>
    fieldErrors[field] ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "";

  const charCounterClass = (current: number, max: number) =>
    current >= max
      ? "text-red-500 font-medium"
      : current >= max - 10
        ? "text-amber-500"
        : "text-gray-400";

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-md rounded-xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] border border-gray-200/80 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#ff4f00]/5 to-transparent pointer-events-none" />

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

        <form id="child-form" onSubmit={handleSubmit} className="px-6 py-6 space-y-5 bg-white">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1 mr-1">
              <label htmlFor="input-fullName" className="block text-[11px] font-bold uppercase tracking-widest text-gray-500">
                Full Name
              </label>
              <span className={`text-xs tabular-nums ${charCounterClass(fullName.length, FULL_NAME_MAX_LENGTH)}`}>
                {fullName.length}/{FULL_NAME_MAX_LENGTH}
              </span>
            </div>
            <input
              id="input-fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                clearFieldError("fullName");
              }}
              placeholder="e.g. John Doe"
              disabled={isSubmitting}
              maxLength={FULL_NAME_MAX_LENGTH}
              className={`w-full rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#ff4f00] focus:ring-1 focus:ring-[#ff4f00] text-gray-900 text-sm p-4 outline-none transition-all duration-300 placeholder:text-gray-400 font-medium disabled:opacity-60 disabled:bg-gray-100/50 disabled:cursor-not-allowed disabled:text-gray-600 ${inputErrorClass("fullName")}`}
            />
            <p className="text-xs text-gray-400 ml-1">
              {FULL_NAME_MIN_LENGTH}–{FULL_NAME_MAX_LENGTH} characters required
            </p>
            {fieldErrors.fullName && (
              <p className="text-xs text-red-500 ml-1">{fieldErrors.fullName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1 mr-1">
              <label htmlFor="input-nickName" className="block text-[11px] font-bold uppercase tracking-widest text-gray-500">
                Nickname <span className="text-gray-400 font-normal lowercase tracking-normal">(Optional)</span>
              </label>
              <span className={`text-xs tabular-nums ${charCounterClass(nickName.length, NICK_NAME_MAX_LENGTH)}`}>
                {nickName.length}/{NICK_NAME_MAX_LENGTH}
              </span>
            </div>
            <input
              id="input-nickName"
              type="text"
              value={nickName}
              onChange={(e) => {
                setNickName(e.target.value);
                clearFieldError("nickName");
              }}
              placeholder="e.g. Junior, Sunny..."
              disabled={isSubmitting}
              maxLength={NICK_NAME_MAX_LENGTH}
              className={`w-full rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#ff4f00] focus:ring-1 focus:ring-[#ff4f00] text-gray-900 text-sm p-4 outline-none transition-all duration-300 placeholder:text-gray-400 font-medium disabled:opacity-60 disabled:bg-gray-100/50 disabled:cursor-not-allowed disabled:text-gray-600 ${inputErrorClass("nickName")}`}
            />
            <p className="text-xs text-gray-400 ml-1">
              Max {NICK_NAME_MAX_LENGTH} characters
            </p>
            {fieldErrors.nickName && (
              <p className="text-xs text-red-500 ml-1">{fieldErrors.nickName}</p>
            )}
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
              onChange={(e) => {
                setDob(e.target.value);
                clearFieldError("dob");
              }}
              disabled={isSubmitting}
              min={minDob}
              max={maxDob}
              className={`w-full rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#ff4f00] focus:ring-1 focus:ring-[#ff4f00] text-gray-900 text-sm p-4 outline-none transition-all duration-300 placeholder:text-gray-400 font-medium disabled:opacity-60 disabled:bg-gray-100/50 disabled:cursor-not-allowed disabled:text-gray-600 ${inputErrorClass("dob")}`}
            />
            <p className="text-xs text-gray-400 ml-1">
              Allowed: child age 0–{MAX_CHILD_AGE_YEARS} years (DOB from {minDob} to {maxDob})
            </p>
            {fieldErrors.dob && (
              <p className="text-xs text-red-500 ml-1">{fieldErrors.dob}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="input-sexId" className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 ml-1">
              Gender
            </label>
            <select
              id="input-sexId"
              value={sexId}
              onChange={(e) => {
                setSexId(Number(e.target.value));
                clearFieldError("sexId");
              }}
              disabled={isSubmitting}
              className={`w-full rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#ff4f00] focus:ring-1 focus:ring-[#ff4f00] text-gray-900 text-sm p-4 outline-none transition-all duration-300 font-medium disabled:opacity-60 disabled:bg-gray-100/50 disabled:cursor-not-allowed disabled:text-gray-600 ${inputErrorClass("sexId")}`}
            >
              {ALLOWED_SEX_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldErrors.sexId && (
              <p className="text-xs text-red-500 ml-1">{fieldErrors.sexId}</p>
            )}
          </div>
        </form>

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

  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}
