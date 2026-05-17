import { Suspense } from "react";
import Header from "@/layout/header/Header";
import Footer from "@/layout/Footer";
import ChatWidget from "@/layout/ChatWidget";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div className="h-16" aria-hidden="true" />}>
        <Header />
      </Suspense>
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
