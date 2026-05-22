"use client";
import { useEffect, useMemo, useState } from "react";
import {
  LookupItem,
  ProductFilters,
  ProductLookups,
} from "@/features/products/types/product";
import { formatCurrency } from "@/features/products/utils/format";

type FilterSidebarProps = {
  lookups: ProductLookups | null;
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
  onRefresh: () => void;
  isLoading: boolean;
  error: string | null;
};

const toggleValue = (list: number[] | undefined, value: number) => {
  const current = list ?? [];
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
};

const renderCheckboxList = (
  items: LookupItem[],
  values: number[] | undefined,
  onToggle: (value: number) => void,
) => (
  <div className="space-y-2">
    {items.map((item) => (
      <label key={item.id} className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="rounded border-slate-300 accent-[#ff6a00]"
          checked={values?.includes(item.id) ?? false}
          onChange={() => onToggle(item.id)}
        />
        <span className="text-sm text-slate-600">{item.label}</span>
      </label>
    ))}
  </div>
);

const normalizeFilters = (filters: ProductFilters): ProductFilters => ({
  ...filters,
  categoryIds: filters.categoryIds ? [...filters.categoryIds] : undefined,
  brandIds: filters.brandIds ? [...filters.brandIds] : undefined,
  priceRangeIds: filters.priceRangeIds ? [...filters.priceRangeIds] : undefined,
  materialIds: filters.materialIds ? [...filters.materialIds] : undefined,
  ageIds: filters.ageIds ? [...filters.ageIds] : undefined,
  sexIds: filters.sexIds ? [...filters.sexIds] : undefined,
  originIds: filters.originIds ? [...filters.originIds] : undefined,
});

export default function FilterSidebar({
  lookups,
  filters,
  onChange,
  onRefresh,
  isLoading,
  error,
}: FilterSidebarProps) {
  const [draftFilters, setDraftFilters] = useState<ProductFilters>(filters);
  const categories = useMemo(() => {
    if (!lookups) return [];
    if (!draftFilters.superCategoryId) return lookups.categories;
    return lookups.categories.filter(
      (item) => item.superCategoryId === draftFilters.superCategoryId,
    );
  }, [lookups, draftFilters.superCategoryId]);

  const priceBounds = useMemo(() => {
    if (!lookups || lookups.priceRanges.length === 0) {
      return { min: 0, max: 0 };
    }
    const mins = lookups.priceRanges.map((item) => item.min);
    const maxs = lookups.priceRanges.map((item) => item.max);
    return {
      min: Math.min(...mins),
      max: Math.max(...maxs),
    };
  }, [lookups]);

  const maxPriceLimit = useMemo(() => {
    if (priceBounds.max === 0) return 0;
    return Math.min(priceBounds.max, 10_000_000);
  }, [priceBounds.max]);

  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });

  useEffect(() => {
    if (priceBounds.max === 0) return;
    setPriceRange({ min: priceBounds.min, max: maxPriceLimit });
  }, [priceBounds]);

  useEffect(() => {
    setDraftFilters(filters);
    if (!filters.priceRangeIds && priceBounds.max > 0) {
      setPriceRange({ min: priceBounds.min, max: maxPriceLimit });
    }
  }, [filters]);

  const updatePriceRange = (nextMin: number, nextMax: number) => {
    const safeMin = Math.min(nextMin, nextMax);
    const safeMax = Math.max(nextMin, nextMax);
    setPriceRange({ min: safeMin, max: safeMax });

    // Lấy price ranges có overlap với khoảng đã chọn (để có kết quả)
    // Backend sẽ filter thêm theo minPrice/maxPrice để đảm bảo chính xác
    const matchedIds = lookups
      ? lookups.priceRanges
          .filter((range) => range.max >= safeMin && range.min <= safeMax)
          .map((range) => range.id)
      : [];

    setDraftFilters((prev) => ({
      ...prev,
      priceRangeIds: matchedIds.length > 0 ? matchedIds : undefined,
      minPrice: safeMin,
      maxPrice: safeMax,
    }));
  };

  if (isLoading) {
    return (
      <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-500">
          Loading filters...
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-red-500">
          {error}
        </div>
      </aside>
    );
  }

  if (!lookups) {
    return null;
  }

  const hasSuperCategories = lookups.superCategories.length > 0;
  const hasCategories = categories.length > 0;
  const hasPriceRanges = lookups.priceRanges.length > 0;
  const hasBrands = lookups.brands.length > 0;
  const hasAges = lookups.ages.length > 0;
  const hasMaterials = lookups.materials.length > 0;
  const hasSexes = lookups.sexes.length > 0;
  const hasOrigins = lookups.origins.length > 0;

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
      {hasSuperCategories && (
        <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
          Main categories
        </h3>
        <select
          value={draftFilters.superCategoryId ?? ""}
          onChange={(event) =>
            setDraftFilters((prev) => ({
              ...prev,
              superCategoryId: event.target.value
                ? Number(event.target.value)
                : undefined,
              categoryId: undefined,
            }))
          }
          className="w-full text-sm border border-slate-200 bg-white rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-[#ff6a00]/20"
        >
          <option value="">All main categories</option>
          {lookups.superCategories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        </div>
      )}

      {hasCategories && (
        <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
          Subcategories
        </h3>
        <select
          value={draftFilters.categoryId ?? ""}
          onChange={(event) =>
            setDraftFilters((prev) => ({
              ...prev,
              categoryId: event.target.value
                ? Number(event.target.value)
                : undefined,
            }))
          }
          className="w-full text-sm border border-slate-200 bg-white rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-[#ff6a00]/20"
        >
          <option value="">All subcategories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        </div>
      )}

      {hasPriceRanges && (
        <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
          Price range
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{formatCurrency(priceRange.min)}</span>
            <span>{formatCurrency(priceRange.max)}</span>
          </div>
          <div className="flex flex-col gap-3">
            <input
              type="range"
              min={priceBounds.min}
              max={maxPriceLimit}
              step={100_000}
              value={priceRange.min}
              list="price-marks"
              onChange={(event) =>
                updatePriceRange(Number(event.target.value), priceRange.max)
              }
              className="w-full accent-[#ff6a00]"
            />
            <input
              type="range"
              min={priceBounds.min}
              max={maxPriceLimit}
              step={100_000}
              value={priceRange.max}
              list="price-marks"
              onChange={(event) =>
                updatePriceRange(priceRange.min, Number(event.target.value))
              }
              className="w-full accent-[#ff6a00]"
            />
            <datalist id="price-marks">
              <option value={0} />
              <option value={2_000_000} />
              <option value={4_000_000} />
              <option value={6_000_000} />
              <option value={8_000_000} />
              <option value={10_000_000} />
            </datalist>
          </div>
        </div>
        </div>
      )}

      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
          Rating
        </h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300 accent-[#ff6a00]"
                checked={draftFilters.rating === rating}
                onChange={() =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    rating: prev.rating === rating ? undefined : rating,
                  }))
                }
              />
              <div className="flex items-center text-orange-400">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className="material-symbols-outlined text-[14px]"
                    style={{ fontVariationSettings: index < rating ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                ))}
              </div>
            </label>
          ))}
        </div>
      </div>

      {hasBrands && (
        <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
          Brand
        </h3>
        {renderCheckboxList(lookups.brands, draftFilters.brandIds, (value) =>
          setDraftFilters((prev) => ({
            ...prev,
            brandIds: toggleValue(prev.brandIds, value),
          })),
        )}
        </div>
      )}

      {hasAges && (
        <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
          Age
        </h3>
        {renderCheckboxList(lookups.ages, draftFilters.ageIds, (value) =>
          setDraftFilters((prev) => ({
            ...prev,
            ageIds: toggleValue(prev.ageIds, value),
          })),
        )}
        </div>
      )}

      {hasMaterials && (
        <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
          Material
        </h3>
        {renderCheckboxList(lookups.materials, draftFilters.materialIds, (value) =>
          setDraftFilters((prev) => ({
            ...prev,
            materialIds: toggleValue(prev.materialIds, value),
          })),
        )}
        </div>
      )}

      {hasSexes && (
        <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
          Gender
        </h3>
        {renderCheckboxList(lookups.sexes, draftFilters.sexIds, (value) =>
          setDraftFilters((prev) => ({
            ...prev,
            sexIds: toggleValue(prev.sexIds, value),
          })),
        )}
        </div>
      )}

      {hasOrigins && (
        <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
          Origin
        </h3>
        {renderCheckboxList(lookups.origins, draftFilters.originIds, (value) =>
          setDraftFilters((prev) => ({
            ...prev,
            originIds: toggleValue(prev.originIds, value),
          })),
        )}
        </div>
      )}

      <div className="pt-6 border-t border-slate-200">
        <div className="flex gap-2">
          <button
            className="flex-1 py-2 rounded-lg text-sm font-bold text-white bg-[#ff6a00] hover:bg-[#e05e00] transition-colors"
            onClick={() => onChange(normalizeFilters(draftFilters))}
          >
            Apply filters
          </button>
          <button
            className="px-3 rounded-lg text-sm font-bold border border-slate-200 text-slate-600 hover:border-[#ff6a00] hover:text-[#ff6a00] transition-colors"
            onClick={() => {
              onRefresh();
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </aside>
  );
}
