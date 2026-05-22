"use client";

interface RecommendationSkeletonProps {
  /** Số card skeleton hiển thị (mặc định 8). */
  count?: number;
  /** Title placeholder hiển thị phía trên skeleton. */
  title?: string;
}

/**
 * Skeleton loading cho recommendation widget — KHÔNG layout shift.
 * Theo spec: dùng cùng kích thước với ProductCard thật để giữ chỗ.
 */
export default function RecommendationSkeleton({
  count = 8,
  title = "Đang tải gợi ý...",
}: RecommendationSkeletonProps) {
  return (
    <section aria-busy="true" aria-live="polite">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl overflow-hidden border border-slate-200"
          >
            <div className="aspect-[3/4] bg-slate-100 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
              <div className="h-5 w-1/2 bg-slate-200 rounded animate-pulse" />
              <div className="h-9 w-full bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
