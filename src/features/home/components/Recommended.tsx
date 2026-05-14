"use client";
interface Product {
  id: number;
  category: string;
  name: string;
  price: string;
  originalPrice?: string;
  badge?: string;
  img: string;
}

const products: Product[] = [
  {
    id: 1,
    category: "WOMEN'S FASHION",
    name: "Premium wool coat",
    price: "1.250.000 VND",
    originalPrice: "1.560.000 VND",
    badge: "-20%",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDSvXBgjASMQbwm3AKatnkqRNRqY4pXNgJm7qcYzvJS8Sf0hPwpytSO8T8inw055KH3lHzVQYcTHhAqCazvz0e2tZBVfcHE-fmcjvrlnajV0BkY-VyTxzLTZgfqZ3_qTVnnPMNlSTBCtDD3OJdJZcK69QgD6x9C_YMkc2-Hqmr9skQxbdkOy5hv7-w-nZxATBKAOSyBnGiaqdkv7o5isCJvsLFitjgW8He3JmX_PRYmTb2o4FQqEeG8NjwZAQyZkkUcrQO6J9w5Kwo",
  },
  {
    id: 2,
    category: "FOOTWEAR",
    name: "Sneaker Pro Run Max",
    price: "2.100.000 VND",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAI9tSaUw6K7ClIxYKh2rAjEnkhY4R5BUkIR8jo5PRtCrlmAbcas8d2ElLKGNuMbgqZNXl-kdcVMrbFRDQVUUSUo_3rVi2SSaFGfUSbXOJ-W598GhxCnBveHbCjXNYJMRIOGd5iwkZRC9hgflI67QkGoNzg2zCD1b5D_bhn7SJ9Yc5Vw2f6-4udaYWUS6-Jg4GM6Iv0n3arr4C4P0z9JrU_Aaduj8QkC3hC1kIuv9hraZ1MF0ELfAmyAtmnxWsYu76NUenzkJ2hp-A",
  },
  {
    id: 3,
    category: "ACCESSORIES",
    name: "SmartWatch Horizon Gen 5",
    price: "4.500.000 VND",
    badge: "NEW",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAZXcJsZlfDu3I5P34AlnI8tEBaCIrtLZcKMo0TFCmnv-65kxmcESqKFte7crFmX8aFxdZJohfl0aqKB9GyJB9An9aCyQeT27qpqwNBwxshLd44hMD6Drf7bLrZ5nsYehdWQe-wP7k4tAoE4wh8YmDvQBfAikcgsfT0zaeM5HVlw1FtL9OzNWV_9B6lmGRt2NsH1iTrCQEf99fjaSEpItlDlV2PetiN7h3thTcWrijmxoAHyfLyxlRuVkwldN7atM7wA9-vVSyEoU",
  },
  {
    id: 4,
    category: "ACCESSORIES",
    name: "Minimalist leather bag",
    price: "890.000 VND",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbG3NQqomnCNoJtG9xZwEINgXClgForE_MWejsbd4zFj-vNh6hsj1XRKHbCy_vwQANxLgcVDixsOhs3sv8g4ZPXZErcwlwyN8qr4Cg2ep2d-BZMwtD8x8RK2R6-zK9DsKHvuzzFt5FiJQDI18F6pQbyrtaTxYsMYcJxI-0sPQVcCrxxNzGayVW0CPU2T4CPwq_IbNQEqqwXbf8alIsiqAoXnLXV-Oz9dsxE5OGcVEpdHai8TU7a25rJSKIuOuuuTVjltHPZT2jA60",
  },
];

export default function Recommended() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-900">Suggestions for you</h3>
        <a href="#" className="font-semibold text-sm hover:underline" style={{ color: "#ff6a00" }}>
          View all
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group bg-white rounded-xl overflow-hidden border border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
              <img
                src={product.img}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {product.badge && (
                <span
                  className="absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-1 rounded"
                  style={{ backgroundColor: "#ff6a00" }}
                >
                  {product.badge}
                </span>
              )}
              <button className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>favorite</span>
              </button>
            </div>

            <div className="p-4">
              <p className="text-xs text-slate-400 mb-1">{product.category}</p>
              <h4
                className="font-semibold text-slate-900 mb-2 overflow-hidden"
                style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}
              >
                {product.name}
              </h4>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg" style={{ color: "#ff6a00" }}>{product.price}</span>
                {product.originalPrice && (
                  <span className="text-slate-400 text-sm line-through">{product.originalPrice}</span>
                )}
              </div>
              <button
                className="w-full mt-4 bg-slate-100 text-slate-900 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ff6a00";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.color = "#0f172a";
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_shopping_cart</span>
                Add to cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
