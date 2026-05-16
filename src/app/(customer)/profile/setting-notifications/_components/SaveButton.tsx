"use client";

interface SaveButtonProps {
  onSave: () => void;
  isSaving: boolean;
  saved: boolean;
}

export default function SaveButton({ onSave, isSaving, saved }: SaveButtonProps) {
  return (
    <div className="flex justify-end mt-4">
      <button
        onClick={onSave}
        disabled={isSaving}
        className={`
          flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all
          ${
            saved
              ? "bg-green-600 text-white cursor-default"
              : isSaving
              ? "bg-[#a14000]/70 text-white cursor-wait"
              : "bg-[#a14000] hover:bg-[#8a3600] text-white shadow-md hover:shadow-lg active:scale-95"
          }
        `}
      >
        <span className="material-symbols-outlined text-[20px]">
          {saved ? "check_circle" : isSaving ? "sync" : "save"}
        </span>
        {saved ? "Changes saved" : isSaving ? "Saving..." : "Save settings"}
      </button>
    </div>
  );
}
