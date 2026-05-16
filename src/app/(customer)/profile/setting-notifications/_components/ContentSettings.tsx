"use client";

import NotificationSection from "@/components/NotificationSection";
import NotificationRow from "@/components/NotificationRow";

interface ContentState {
  orderUpdates: boolean;
  promotions: boolean;
  stockAlerts: boolean;
  blogPosts: boolean;
}

interface ContentSettingsProps {
  values: ContentState;
  onChange: (key: keyof ContentState, value: boolean) => void;
}

export default function ContentSettings({ values, onChange }: ContentSettingsProps) {
  return (
    <NotificationSection title="Notification content">
      <NotificationRow
        id="content-orders"
        title="Order updates"
        description="Shipping status and payment confirmation"
        checked={values.orderUpdates}
        onChange={(v) => onChange("orderUpdates", v)}
      />
      <NotificationRow
        id="content-promos"
        title="Promotions & Offers"
        description="Discount codes and special promotion campaigns"
        checked={values.promotions}
        onChange={(v) => onChange("promotions", v)}
      />
      <NotificationRow
        id="content-stock"
        title="Stock alerts"
        description="Notifications when products you care about are back in stock"
        checked={values.stockAlerts}
        onChange={(v) => onChange("stockAlerts", v)}
      />
      <NotificationRow
        id="content-blog"
        title="New blog posts"
        description="Latest trends and shopping tips"
        checked={values.blogPosts}
        onChange={(v) => onChange("blogPosts", v)}
        showDivider={false}
      />
    </NotificationSection>
  );
}
