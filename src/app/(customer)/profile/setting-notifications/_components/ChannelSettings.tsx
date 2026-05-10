"use client";

import NotificationSection from "@/components/NotificationSection";
import NotificationRow from "@/components/NotificationRow";

interface ChannelState {
  email: boolean;
  webPush: boolean;
}

interface ChannelSettingsProps {
  values: ChannelState;
  onChange: (key: keyof ChannelState, value: boolean) => void;
}

export default function ChannelSettings({ values, onChange }: ChannelSettingsProps) {
  return (
    <NotificationSection title="Kênh thông báo">
      <NotificationRow
        id="channel-email"
        title="Nhận thông báo qua Email"
        description="Nhận thông tin cập nhật trực tiếp vào hộp thư đến của bạn"
        checked={values.email}
        onChange={(v) => onChange("email", v)}
      />
      <NotificationRow
        id="channel-webpush"
        title="Thông báo đẩy trên trình duyệt (Web Push)"
        description="Nhận thông báo ngay lập tức khi đang sử dụng trình duyệt"
        checked={values.webPush}
        onChange={(v) => onChange("webPush", v)}
        showDivider={false}
      />
    </NotificationSection>
  );
}
