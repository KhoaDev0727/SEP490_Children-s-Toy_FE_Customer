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
    <NotificationSection title="Nội dung thông báo">
      <NotificationRow
        id="content-orders"
        title="Cập nhật đơn hàng"
        description="Trạng thái vận chuyển và xác nhận thanh toán"
        checked={values.orderUpdates}
        onChange={(v) => onChange("orderUpdates", v)}
      />
      <NotificationRow
        id="content-promos"
        title="Khuyến mãi & Ưu đãi"
        description="Mã giảm giá và các chương trình khuyến mãi đặc biệt"
        checked={values.promotions}
        onChange={(v) => onChange("promotions", v)}
      />
      <NotificationRow
        id="content-stock"
        title="Thông báo kho hàng (Stock Alerts)"
        description="Thông báo khi sản phẩm bạn quan tâm có hàng trở lại"
        checked={values.stockAlerts}
        onChange={(v) => onChange("stockAlerts", v)}
      />
      <NotificationRow
        id="content-blog"
        title="Bài viết mới từ Blog"
        description="Cập nhật những xu hướng và mẹo mua sắm mới nhất"
        checked={values.blogPosts}
        onChange={(v) => onChange("blogPosts", v)}
        showDivider={false}
      />
    </NotificationSection>
  );
}
