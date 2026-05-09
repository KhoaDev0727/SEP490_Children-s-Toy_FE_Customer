"use client";

import NotificationToggle from "@/components/NotificationToggle";

interface NotificationRowProps {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  showDivider?: boolean;
}

export default function NotificationRow({
  id,
  title,
  description,
  checked,
  onChange,
  disabled = false,
  showDivider = true,
}: NotificationRowProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-4 py-1">
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] leading-[1.4] font-semibold text-[#261812]">
            {title}
          </h3>
          <p className="text-[14px] leading-[1.5] font-normal text-[#5a4136] mt-0.5">
            {description}
          </p>
        </div>
        <NotificationToggle
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      {showDivider && (
        <div className="border-t border-[#e2bfb0]/30 my-1" />
      )}
    </>
  );
}
