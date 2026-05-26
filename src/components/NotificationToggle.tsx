"use client";

interface NotificationToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function NotificationToggle({
  id,
  checked,
  onChange,
  disabled = false,
}: NotificationToggleProps) {
  return (
    <label
      htmlFor={id}
      className={`relative inline-flex items-center ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
    >
      <input
        id={id}
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div
        className="
          w-11 h-6
          bg-gray-200
          peer-focus:outline-none
          rounded-full
          peer
          peer-checked:after:translate-x-full
          rtl:peer-checked:after:-translate-x-full
          peer-checked:after:border-white
          after:content-['']
          after:absolute
          after:top-[2px]
          after:start-[2px]
          after:bg-white
          after:border-gray-300
          after:border
          after:rounded-full
          after:h-5
          after:w-5
          after:transition-all
          peer-checked:bg-[#ff4f00]
          transition-colors
          duration-200
        "
      />
    </label>
  );
}
