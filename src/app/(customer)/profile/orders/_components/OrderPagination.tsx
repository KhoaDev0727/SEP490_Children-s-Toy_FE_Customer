"use client";

interface OrderPaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function OrderPagination({
  currentPage,
  totalPages,
  onChange,
}: OrderPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="px-6 py-6 border-t border-[#e2bfb0]/20 bg-slate-50/30 flex justify-center items-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-[#5a4136] hover:bg-white disabled:opacity-30 transition-all shadow-sm"
      >
        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onChange(page)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
            currentPage === page
              ? "text-white shadow-md shadow-[#ff6a00]/20"
              : "text-[#5a4136] hover:bg-white border border-transparent hover:border-slate-200 shadow-sm"
          }`}
          style={
            currentPage === page
              ? { background: "linear-gradient(135deg, #ff6a00, #ff8a1f)" }
              : {}
          }
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-[#5a4136] hover:bg-white disabled:opacity-30 transition-all shadow-sm"
      >
        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
      </button>
    </div>
  );
}
