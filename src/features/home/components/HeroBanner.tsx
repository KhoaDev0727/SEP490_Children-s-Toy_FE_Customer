"use client";
import bannerImage from "@/assets/image/Logo/banner.png";

export default function HeroBanner() {
  return (
    <section
      className="relative w-full rounded-2xl overflow-hidden"
      style={{ aspectRatio: "1714 / 918" }}
    >
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${bannerImage.src}')`,
        }}
      />
    </section>
  );
}
