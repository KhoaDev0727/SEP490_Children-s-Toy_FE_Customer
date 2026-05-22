"use client";

import { Child } from "@/features/profile/types/children";

const AVATAR_COLORS = [
  { bg: "bg-[#dae2fd]", text: "text-[#5c647a]" },
  { bg: "bg-[#009eff]", text: "text-white" },
  { bg: "bg-[#ff6a00]", text: "text-white" },
  { bg: "bg-[#4caf50]", text: "text-white" },
  { bg: "bg-[#9c27b0]", text: "text-white" },
];

type Props = {
  child: Child;
  index: number;
  onEdit: (child: Child) => void;
  onDelete: (id: number) => void;
};

export default function ChildCard({ child, index, onEdit, onDelete }: Props) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const avatarLetter = child.fullName.trim().charAt(0).toUpperCase();
  
  const formattedDob = child.dob 
    ? new Date(child.dob).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) 
    : "Not updated";
  
  const genderLabel = child.sexId === 1 ? "Male" : child.sexId === 2 ? "Female" : "Other";

  return (
    <div className="bg-white rounded-xl p-6 border border-[#e2bfb0]/50 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Decorative circle */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff6a00]/10 rounded-bl-full -z-0 pointer-events-none" />

      {/* Header row */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${color.bg} ${color.text}`}
          >
            {avatarLetter}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#261812]">{child.fullName}</h3>
            <p className="text-xs text-[#5a4136]">Nickname: {child.nickName || "N/A"}</p>
          </div>
        </div>

        {/* Edit/Delete buttons — visible on hover */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(child)}
            className="w-8 h-8 rounded-full bg-[#f8ddd2] text-[#5a4136] flex items-center justify-center hover:bg-[#ffdbcc] hover:text-[#571f00] transition-colors"
            title="Edit"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            onClick={() => onDelete(child.childId)}
            className="w-8 h-8 rounded-full bg-[#f8ddd2] text-[#ba1a1a] flex items-center justify-center hover:bg-[#ffdad6] transition-colors"
            title="Delete"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>

      {/* Info row */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-[#e2bfb0]/30 relative z-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#565e74] mb-1">Date of Birth</p>
          <p className="text-sm font-semibold text-[#261812]">{formattedDob}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#565e74] mb-1">Gender</p>
          <p className="text-sm font-semibold text-[#261812]">{genderLabel}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#565e74] mb-1">Edits</p>
          <p className="text-sm font-semibold text-[#261812]">{child.editCount}/2</p>
        </div>
      </div>
    </div>
  );
}
