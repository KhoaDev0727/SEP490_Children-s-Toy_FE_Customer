"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import { notificationPreferencesApi } from "@/features/profile/services/notification-preferences-api";
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

function mapApiToForm(api: {
  emailOptIn: boolean;
  webPushOptIn: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  stockAlerts: boolean;
  blogAlerts: boolean;
}): { channels: ChannelState; content: ContentState } {
  return {
    channels: {
      email: api.emailOptIn,
      webPush: api.webPushOptIn,
    },
    content: {
      orderUpdates: api.orderUpdates,
      promotions: api.promotions,
      stockAlerts: api.stockAlerts,
      blogPosts: api.blogAlerts,
    },
  };
}

function mapFormToPayload(channels: ChannelState, content: ContentState) {
  return {
    emailOptIn: channels.email,
    webPushOptIn: channels.webPush,
    orderUpdates: content.orderUpdates,
    promotions: content.promotions,
    stockAlerts: content.stockAlerts,
    blogAlerts: content.blogPosts,
  };
}

export default function NotificationSettingsPage() {
  const router = useRouter();
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

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleAuthError = useCallback(
    (error: unknown) => {
      const status = (error as AxiosError)?.response?.status;
      if (status === 401) {
        router.push("/login");
        return true;
      }
      return false;
    },
    [router],
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await notificationPreferencesApi.getMy();
        if (cancelled) return;
        const mapped = mapApiToForm(data);
        setChannels(mapped.channels);
        setContent(mapped.content);
      } catch (err) {
        if (cancelled) return;
        if (handleAuthError(err)) return;
        setLoadError("Could not load notification settings. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [handleAuthError]);

  const handleChannelChange = (key: keyof ChannelState, value: boolean) => {
    setChannels((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setSaveError(null);
  };

  const handleContentChange = (key: keyof ContentState, value: boolean) => {
    setContent((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const savedData = await notificationPreferencesApi.updateMy(
        mapFormToPayload(channels, content),
      );
      const mapped = mapApiToForm(savedData);
      setChannels(mapped.channels);
      setContent(mapped.content);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      if (handleAuthError(err)) return;
      setSaveError("Could not save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
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
          {isLoading ? (
            <p className="text-[14px] text-[#5a4136]">
              Loading your preferences…
            </p>
          ) : loadError ? (
            <p className="text-[14px] text-red-700" role="alert">
              {loadError}
            </p>
          ) : (
            <>
              <ChannelSettings
                values={channels}
                onChange={handleChannelChange}
              />

              <div className="border-t border-[#e2bfb0]/40" />

              <ContentSettings
                values={content}
                onChange={handleContentChange}
              />

              {saveError ? (
                <p className="text-[14px] text-red-700" role="alert">
                  {saveError}
                </p>
              ) : null}

              <SaveButton
                onSave={handleSave}
                isSaving={isSaving}
                saved={saved}
              />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
