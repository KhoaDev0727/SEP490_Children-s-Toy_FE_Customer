"use client";

import {
  getSexLabel,
  MAX_CHILD_PROFILE_EDITS,
} from "@/features/profile/constants/children.constants";
import { Child } from "@/features/profile/types/children";

const AVATAR_COLORS = [
  { bg: "bg-[#dae2fd]", text: "text-[#5c647a]" },
  { bg: "bg-[#009eff]", text: "text-white" },
  { bg: "bg-[#ff4f00]", text: "text-white" },
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
  const isEditLimitReached = child.editCount >= MAX_CHILD_PROFILE_EDITS;

  const formattedDob = child.dob
    ? new Date(child.dob).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Not updated";

  const genderLabel = getSexLabel(child.sexId);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff4f00]/5 rounded-bl-full -z-0 pointer-events-none" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${color.bg} ${color.text}`}
          >
            {avatarLetter}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{child.fullName}</h3>
            <p className="text-xs text-gray-500">Nickname: {child.nickName || "N/A"}</p>
          </div>
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(child)}
            disabled={isEditLimitReached}
            title={
              isEditLimitReached
                ? `You can only edit a child profile up to ${MAX_CHILD_PROFILE_EDITS} times.`
                : "Edit"
            }
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isEditLimitReached
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            onClick={() => onDelete(child.childId)}
            className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
            title="Delete"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100 relative z-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">Date of Birth</p>
          <p className="text-sm font-semibold text-gray-950">{formattedDob}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">Gender</p>
          <p className="text-sm font-semibold text-gray-950">{genderLabel}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">Edits</p>
          <p className="text-sm font-semibold text-gray-950">{child.editCount}/{MAX_CHILD_PROFILE_EDITS}</p>
        </div>
      </div>
    </div>
  );
}
