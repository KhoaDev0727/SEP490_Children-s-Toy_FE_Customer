import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import FlashSale from "@/components/FlashSale";
import Recommended from "@/components/Recommended";
import TrendingNow from "@/components/TrendingNow";
import RecentlyViewed from "@/components/RecentlyViewed";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

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
