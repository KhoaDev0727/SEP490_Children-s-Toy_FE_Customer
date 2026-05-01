import HeroBanner from "@/features/home/components/HeroBanner";
import FlashSale from "@/features/home/components/FlashSale";
import Recommended from "@/features/home/components/Recommended";
import TrendingNow from "@/features/home/components/TrendingNow";
import RecentlyViewed from "@/features/home/components/RecentlyViewed";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      <HeroBanner />
      <FlashSale />
      <Recommended />
      <TrendingNow />
      <RecentlyViewed />
    </div>
  );
}
