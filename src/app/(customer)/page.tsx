import { Suspense } from "react";
import HeroBanner from "@/features/home/components/HeroBanner";
import FlashSale from "@/features/home/components/FlashSale";
import RecentlyViewed from "@/features/home/components/RecentlyViewed";
import RecommendationWidget from "@/components/recommendation/RecommendationWidget";
import { WIDGET_CODES } from "@/features/recommendation/types/recommendation";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      <HeroBanner />
      <RecommendationWidget
        widgetCode={WIDGET_CODES.HOMEPAGE_TRENDING}
        title="Today's Trends"
        subtitle="The most popular products in the last 24 hours"
        source="home_trending"
      />

      <Suspense fallback={null}>
        <FlashSale />
      </Suspense>

      <RecommendationWidget
        widgetCode={WIDGET_CODES.HOMEPAGE_PERSONAL}
        title="Recommended for You"
        source="home_personal"
      />

      <RecentlyViewed />
    </div>
  );
}
