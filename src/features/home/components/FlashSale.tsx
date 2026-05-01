"use client";
import { useState, useEffect } from "react";

interface FlashItem {
  name: string;
  salePrice: string;
  originalPrice: string;
  soldPercent: number;
  img: string;
  almostOut?: boolean;
}

const flashItems: FlashItem[] = [
  {
    name: "Tai nghe Studio Wireless",
    salePrice: "850.000đ",
    originalPrice: "1.700.000đ",
    soldPercent: 65,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVixBbhZTlJXW5qjgFOj1Or8O6QlnuihUzbxbdwBDcnexMM7nd4LS9EDhNf6kHLaDLw0eNHqX9PqROaAiNv73UyZA5TmOTlsulmPPAuyf8x88q8e9QpZXZfZubU2OPXn5LN7I-hULL9u0kZgh7jMZ-q3QtdgNS3gCuGTw-jjRW9RwV5TuoepJtR0XbTDkw7vDHcCGek6Nr8bxVkihY9SKObGTxCgxkLEuPcIuk5p9rNHmHDRwRLAKP4QbLmMW5DnjvrMpLo2yEZTM",
  },
  {
    name: "Bàn phím cơ RGB Pro",
    salePrice: "1.290.000đ",
    originalPrice: "2.150.000đ",
    soldPercent: 42,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAX4cksixDYIG1ynxHVMo66aqdOGgcztuon4_GSxcFmcwq51bozRc6o5NCQQ4Ot6Gu4eJGi2aPMdvykkDmMzaFHq6CnJ9vncuNFONsTFFP5UA3mEivn7YsnsIHaqUEfkOjB19F7xj2-AphOh6PxID1rD6mOsyT1Jg2ls9n6HTCBAleC-XCfyA7lInFOeM4gBW2t4ccEOcx7LWQVibpZ0EP3mJxx9-gQw4NdetTZjV68EH8S1XORSELcfDPxB0uZue2DJYlvTLJz00Q",
  },
  {
    name: "Máy lọc không khí AirPure",
    salePrice: "2.450.000đ",
    originalPrice: "4.900.000đ",
    soldPercent: 88,
    almostOut: true,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAZXcJsZlfDu3I5P34AlnI8tEBaCIrtLZcKMo0TFCmnv-65kxmcESqKFte7crFmX8aFxdZJohfl0aqKB9GyJB9An9aCyQeT27qpqwNBwxshLd44hMD6Drf7bLrZ5nsYehdWQe-wP7k4tAoE4wh8YmDvQBfAikcgsfT0zaeM5HVlw1FtL9OzNWV_9B6lmGRt2NsH1iTrCQEf99fjaSEpItlDlV2PetiN7h3thTcWrijmxoAHyfLyxlRuVkwldN7atM7wA9-vVSyEoU",
  },
  {
    name: "Smartwatch Sport X1",
    salePrice: "590.000đ",
    originalPrice: "950.000đ",
    soldPercent: 25,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKAGsEAeEJEvSnt0jcM7JAdDA0owkRX0-NSQ0FVipUJqgeKof0cW8US-TuZG-X35dMHBeMnZuhQj-sjyFI9qw5JJH7hITU78GjPijkSL9nwqetRKXWerJm23NvSH0Fg5IkW5-OelkWcWsjsoZ6K9otTBZ86p8FxsbFYqJ6U2Y8_RfDW3c1sVaN6Gk19L-DOqxmhTiuqAjlxEhvxIE3PbESz3TM5A6MhjNlrG2QhTSGawiZ_IWfrnKJ2ZVCxHAue-rmsxF97NINLd4",
  },
  {
    name: "Bình giữ nhiệt Vacuum",
    salePrice: "320.000đ",
    originalPrice: "580.000đ",
    soldPercent: 55,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoIXVgZsiJL6dIZBXHWF0C9R7A76Zz9Okpm3Ol5W12L9L3tNKWqRvNdKDPtVYB93N95kvvKY5FuI625p9np7t7ZOUtEfEQsVWU66IY7AOOlikzpwYSoM6lRTZemZAz0Tx8Vowe2DSlI7GoiDMxr3qFo2cK0_z47NUeFWP9I86AK2vmijTMziV0r4jvwCF-md-KxZV_rOUUWr5ZpUt7hD4PFWdq5iVOwjzyOsi3KLq9Sk-QaLsapCIbxzyQuakmktTElMHchfadsMw",
  },
];

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { h, m, s };
}

function TimeBlock({ value }: { value: number }) {
  return (
    <div
      className="px-2 py-1 rounded font-mono font-bold text-lg text-white"
      style={{ backgroundColor: "#1e293b" }}
    >
      {String(value).padStart(2, "0")}
    </div>
  );
}

export default function FlashSale() {
  const { h, m, s } = useCountdown(2 * 3600 + 15 * 60 + 30);

  return (
    <section
      className="rounded-3xl p-6 sm:p-8 shadow-sm"
      style={{ border: "2px solid rgba(255, 106, 0, 0.2)", backgroundColor: "#fff" }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl font-bold" style={{ color: "#ff6a00", fontSize: 30 }}>
            bolt
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tighter" style={{ color: "#ff6a00" }}>
            FLASH SALE
          </h3>
          <div className="hidden sm:block h-8 w-px bg-slate-200 mx-2" />
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-500 uppercase">Kết thúc sau:</p>
            <div className="flex gap-1 items-center">
              <TimeBlock value={h} />
              <span className="font-bold text-slate-900">:</span>
              <TimeBlock value={m} />
              <span className="font-bold text-slate-900">:</span>
              <TimeBlock value={s} />
            </div>
          </div>
        </div>
        <a
          href="#"
          className="text-slate-500 font-semibold flex items-center gap-1 transition-colors hover:text-[#ff6a00]"
        >
          Xem tất cả
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        </a>
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {flashItems.map((item, i) => (
          <div
            key={item.name}
            className={`group relative flex flex-col ${i === 4 ? "hidden lg:flex" : ""}`}
          >
            <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
              <img
                src={item.img}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div
                className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1"
                style={{ backgroundColor: "#ff6a00" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>bolt</span>
                FLASH SALE
              </div>
            </div>
            <h4 className="font-medium text-slate-900 text-sm mb-1 overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
              {item.name}
            </h4>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-bold text-lg" style={{ color: "#ff6a00" }}>{item.salePrice}</span>
              <span className="text-slate-400 text-xs line-through">{item.originalPrice}</span>
            </div>
            <div className="mt-auto">
              <div className="w-full bg-slate-100 h-4 rounded-full relative overflow-hidden mb-3">
                <div
                  className="absolute inset-0"
                  style={{
                    width: `${item.soldPercent}%`,
                    background: "linear-gradient(to right, #fb923c, #ff6a00)",
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white z-10">
                  {item.almostOut ? `Sắp cháy hàng (${item.soldPercent}%)` : `Đã bán ${item.soldPercent}%`}
                </span>
              </div>
              <button
                className="w-full py-2 rounded-lg font-bold text-sm transition-all border"
                style={{
                  color: "#ff6a00",
                  backgroundColor: "rgba(255, 106, 0, 0.08)",
                  borderColor: "rgba(255, 106, 0, 0.2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ff6a00";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 106, 0, 0.08)";
                  e.currentTarget.style.color = "#ff6a00";
                }}
              >
                Mua Ngay
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
