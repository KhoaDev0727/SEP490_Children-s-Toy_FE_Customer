import HeroBanner from "@/features/home/components/HeroBanner";
import FlashSale from "@/features/home/components/FlashSale";
import RecentlyViewed from "@/features/home/components/RecentlyViewed";
import RecommendationWidget from "@/components/recommendation/RecommendationWidget";
import { WIDGET_CODES } from "@/features/recommendation/types/recommendation";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      <HeroBanner />
      <FlashSale />

      <RecommendationWidget
        widgetCode={WIDGET_CODES.HOMEPAGE_PERSONAL}
        title="Gợi ý dành riêng cho bạn"
        subtitle="Dựa trên hành vi mua sắm của bạn"
        source="home_personal"
      />

      <RecommendationWidget
        widgetCode={WIDGET_CODES.HOMEPAGE_TRENDING}
        title="Xu hướng hôm nay"
        subtitle="Các sản phẩm được quan tâm nhiều nhất trong 24 giờ qua"
        source="home_trending"
      />

      <RecentlyViewed />
    </div>
  );
}
