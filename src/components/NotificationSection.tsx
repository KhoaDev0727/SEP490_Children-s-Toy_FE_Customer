"use client";

interface NotificationSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function NotificationSection({
  title,
  children,
}: NotificationSectionProps) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-bold text-[#261812] border-l-4 border-[#a14000] pl-3 leading-tight">
        {title}
      </h2>
      {children}
    </div>
  );
}
