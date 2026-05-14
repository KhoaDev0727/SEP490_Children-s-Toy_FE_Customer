"use client";
interface TrendingItem {
  name: string;
  price: string;
  badge: string;
  img: string;
}

const trendingItems: TrendingItem[] = [
  {
    name: "Tai nghe Noise Cancel",
    price: "3.450.000 VND",
    badge: "HOT",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVixBbhZTlJXW5qjgFOj1Or8O6QlnuihUzbxbdwBDcnexMM7nd4LS9EDhNf6kHLaDLw0eNHqX9PqROaAiNv73UyZA5TmOTlsulmPPAuyf8x88q8e9QpZXZfZubU2OPXn5LN7I-hULL9u0kZgh7jMZ-q3QtdgNS3gCuGTw-jjRW9RwV5TuoepJtR0XbTDkw7vDHcCGek6Nr8bxVkihY9SKObGTxCgxkLEuPcIuk5p9rNHmHDRwRLAKP4QbLmMW5DnjvrMpLo2yEZTM",
  },
  {
    name: "Camera Retro Fusion",
    price: "12.200.000 VND",
    badge: "TRENDY",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxeZl4F-0ut19J5cegW-GgVR08IVCrswPr9uHsCPAa-eqJ2T4cDiKmNSL_V6Hn-n-cDvzmMEL4A_eqRFgePBS8Lny_XTMfeE6svCweISeDR4T70HmMYigWK-mt-dw_Y2WgR8PYST8VmJ3RuEdDwIS7n6_j8o_KPBa26D_RilrvJfhBZIGdbV-jrK03DZse9ZREaK-2X_K9wKEywP6ReVRZKr3QQhWLwYQAd0AMQpK-yH7_r_e-QHn1v5HuOWpV6pUhEXe0Jvb2OwE",
  },
  {
    name: "Minimalist Desk Lamp",
    price: "450.000 VND",
    badge: "SOLD OUT",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAX4cksixDYIG1ynxHVMo66aqdOGgcztuon4_GSxcFmcwq51bozRc6o5NCQQ4Ot6Gu4eJGi2aPMdvykkDmMzaFHq6CnJ9vncuNFONsTFFP5UA3mEivn7YsnsIHaqUEfkOjB19F7xj2-AphOh6PxID1rD6mOsyT1Jg2ls9n6HTCBAleC-XCfyA7lInFOeM4gBW2t4ccEOcx7LWQVibpZ0EP3mJxx9-gQw4NdetTZjV68EH8S1XORSELcfDPxB0uZue2DJYlvTLJz00Q",
  },
  {
    name: "Urban Sun Sunglasses",
    price: "620.000 VND",
    badge: "NEW",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKAGsEAeEJEvSnt0jcM7JAdDA0owkRX0-NSQ0FVipUJqgeKof0cW8US-TuZG-X35dMHBeMnZuhQj-sjyFI9qw5JJH7hITU78GjPijkSL9nwqetRKXWerJm23NvSH0Fg5IkW5-OelkWcWsjsoZ6K9otTBZ86p8FxsbFYqJ6U2Y8_RfDW3c1sVaN6Gk19L-DOqxmhTiuqAjlxEhvxIE3PbESz3TM5A6MhjNlrG2QhTSGawiZ_IWfrnKJ2ZVCxHAue-rmsxF97NINLd4",
  },
];

export default function TrendingNow() {
  return (
    <section
      className="rounded-3xl px-4 sm:px-6 lg:px-8 py-12"
      style={{ backgroundColor: "rgba(255, 106, 0, 0.05)" }}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h3 className="text-3xl font-bold text-slate-900 mb-2">Trending now</h3>
          <p className="text-slate-500">Most loved products from the past week.</p>
        </div>
        <div className="flex gap-2">
          <button
            className="p-2 border border-slate-300 rounded-full bg-white text-slate-600 transition-colors"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#ff6a00";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.color = "#475569";
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>chevron_left</span>
          </button>
          <button
            className="p-2 border border-slate-300 rounded-full bg-white text-slate-600 transition-colors"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#ff6a00";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.color = "#475569";
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>chevron_right</span>
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
        {trendingItems.map((item) => (
          <div
            key={item.name}
            className="min-w-[280px] bg-white rounded-xl p-3 border border-slate-200 shadow-sm"
          >
            <div className="aspect-square rounded-lg overflow-hidden mb-3">
              <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-900">{item.name}</h4>
                <p className="font-semibold" style={{ color: "#ff6a00" }}>{item.price}</p>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">
                {item.badge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
