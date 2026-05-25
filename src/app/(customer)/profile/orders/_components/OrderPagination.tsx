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

  // Logic to show truncated pages: 1 ... 4 5 6 ... 10
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="px-6 py-6 border-t border-gray-200/60 bg-gray-50/30 flex justify-center items-center gap-2">
      <button
        onClick={() => {
          onChange(Math.max(1, currentPage - 1));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-gray-500 hover:bg-white disabled:opacity-30 transition-all shadow-sm"
      >
        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
      </button>

      {visiblePages.map((page, index) => (
        <button
          key={index}
          onClick={() => {
            if (typeof page === "number") {
              onChange(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          disabled={page === "..."}
          className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
            currentPage === page
              ? "text-white bg-[#ff4f00] shadow-sm"
              : page === "..."
                ? "text-slate-400 cursor-default"
                : "text-gray-500 hover:bg-white border border-transparent hover:border-gray-200 shadow-sm"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => {
          onChange(Math.min(totalPages, currentPage + 1));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-gray-500 hover:bg-white disabled:opacity-30 transition-all shadow-sm"
      >
        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
      </button>
    </div>
  );
}
