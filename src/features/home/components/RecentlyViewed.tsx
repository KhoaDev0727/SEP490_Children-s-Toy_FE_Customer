"use client";
const recentItems = [
  {
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoIXVgZsiJL6dIZBXHWF0C9R7A76Zz9Okpm3Ol5W12L9L3tNKWqRvNdKDPtVYB93N95kvvKY5FuI625p9np7t7ZOUtEfEQsVWU66IY7AOOlikzpwYSoM6lRTZemZAz0Tx8Vowe2DSlI7GoiDMxr3qFo2cK0_z47NUeFWP9I86AK2vmijTMziV0r4jvwCF-md-KxZV_rOUUWr5ZpUt7hD4PFWdq5iVOwjzyOsi3KLq9Sk-QaLsapCIbxzyQuakmktTElMHchfadsMw",
    alt: "White cotton t-shirt",
    opacity: false,
  },
  {
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuASQR2SDAscA6t1zXsZkLC6k9zg9rERbAanSThk4ZDfiHtjxMax9bfc8WFVR8XU2VNxI1EeQ4X7jYQXruKClUdHTfnnl-ynT3YxIjCcMh60L1cpXi6qn2c6vq8P0jrTuR2RUcOw1So8pbbfvcCc1LaxnorY2EF3IpScid9se0TSHmf5SN8wvn8KUemSTwspe8N7DBipfi8XLbHeqqfM9w7GgyPRZ17yD6HgCAvOJUezb0Klkh66KuQY0pJdz9H4Jv53tUndD9cnd5I",
    alt: "Classic blue jeans",
    opacity: false,
  },
  {
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9NYFgqN6gZPcffoV4bdZYeGgAu5J90xbzUvM0Q3-L5K_pyP3vy8khrKRw_G7sP3EhPhe2GOgHfbG80u3Oos8aP2RIuwRq_tLDJLZVONjL1ekB8sTkozApPSqDnc7Bgrrg2ITpAAnipy7A5mhwr7JDn7cw9C93Ggfqyhr2ya-5MoU4XVwnC-5r5hHeHlnQTP7vOQDTBQ-FO5NwlrIsjJKJmJrloYm5vCo_8Ff2bXUff5U4BOjgyZML4-OEMQKYgomhW5fYozkhOUI",
    alt: "Premium leather belt",
    opacity: false,
  },
  {
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuprdXPfyX8FGl7PtDIXTEY6F6U_PgL2Z-_vhwrOTtfeVqYjuCk-VJf8PNHbS-fQjXgZojC93KVfhe_sylw6GrGY8BBWxwGPjVC5ypLueAMaCoKxRtSil6mp0cSbNLPJp30kcrWcqrZ4KDKKP2tFxEkhowOL_0dAJa_REMCbwurLe1xM8-DoISXidvs079gb0WSy2zvYf-fEwzcETnGZXlAhXesfWiLck9260PQrPf7OrndyKJ0UvtCXd6oz8_8FkkiYYNQTB8N9k",
    alt: "Elegant mini wallet",
    opacity: true,
  },
];

export default function RecentlyViewed() {
  return (
    <section>
      <h3 className="text-xl font-bold text-slate-900 mb-6">Recently viewed products</h3>
      <div className="flex gap-4 overflow-x-auto no-scrollbar">
        {recentItems.map((item, i) => (
          <div
            key={i}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-slate-200 ${item.opacity ? "opacity-50" : ""}`}
          >
            <img src={item.img} alt={item.alt} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}
