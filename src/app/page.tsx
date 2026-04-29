import Header from "@/components/header/Header";
import HeroBanner from "@/components/home/HeroBanner";
import FlashSale from "@/components/home/FlashSale";
import Recommended from "@/components/home/Recommended";
import TrendingNow from "@/components/home/TrendingNow";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import Footer from "@/components/common/Footer";
import ChatWidget from "@/components/common/ChatWidget";

export default function Home() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        <HeroBanner />
        <FlashSale />
        <Recommended />
        <TrendingNow />
        <RecentlyViewed />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
