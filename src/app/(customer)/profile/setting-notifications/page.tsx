"use client";

import { useState } from "react";
import ProfileSidebar from "../_components/ProfileSidebar";
import ChannelSettings from "./_components/ChannelSettings";
import ContentSettings from "./_components/ContentSettings";
import SaveButton from "./_components/SaveButton";

type ChannelState = {
  email: boolean;
  webPush: boolean;
};

type ContentState = {
  orderUpdates: boolean;
  promotions: boolean;
  stockAlerts: boolean;
  blogPosts: boolean;
};

export default function NotificationSettingsPage() {
  const [channels, setChannels] = useState<ChannelState>({
    email: true,
    webPush: true,
  });

  const [content, setContent] = useState<ContentState>({
    orderUpdates: true,
    promotions: true,
    stockAlerts: false,
    blogPosts: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChannelChange = (key: keyof ChannelState, value: boolean) => {
    setChannels((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleContentChange = (key: keyof ContentState, value: boolean) => {
    setContent((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Sidebar */}
      <ProfileSidebar />

      {/* Main panel */}
      <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-[#e2bfb0]/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2bfb0]/30 bg-white">
          <h1 className="text-2xl font-bold text-[#261812]">
            Notification Settings
          </h1>
          <p className="mt-1 text-sm text-[#5a4136]">
            Customize how you want to receive notifications from ShopX
          </p>
        </div>

        {/* Settings List */}
        <div className="px-6 py-8 flex flex-col gap-8">
          <ChannelSettings values={channels} onChange={handleChannelChange} />

          <div className="border-t border-[#e2bfb0]/40" />

          <ContentSettings values={content} onChange={handleContentChange} />

          <SaveButton onSave={handleSave} isSaving={isSaving} saved={saved} />
        </div>
      </section>
    </main>
  );
}
