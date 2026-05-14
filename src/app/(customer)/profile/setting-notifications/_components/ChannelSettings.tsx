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
    <NotificationSection title="Notification channels">
      <NotificationRow
        id="channel-email"
        title="Receive notifications via Email"
        description="Get updates delivered directly to your inbox"
        checked={values.email}
        onChange={(v) => onChange("email", v)}
      />
      <NotificationRow
        id="channel-webpush"
        title="Browser push notifications (Web Push)"
        description="Receive instant notifications while browsing"
        checked={values.webPush}
        onChange={(v) => onChange("webPush", v)}
        showDivider={false}
      />
    </NotificationSection>
  );
}
