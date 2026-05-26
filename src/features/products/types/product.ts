export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ProductList {
  productId: number;
  productName: string;
  price: number;
  discountedPrice?: number | null;
  discountPercent?: number | null;
  promotionType?: string | null;
  promotionSoldQuantity?: number | null;
  promotionSaleQuantity?: number | null;
  quantity: number;
  productStatus: string;
  status: string;
  categoryId: number;
  categoryName: string;
  brandId?: number | null;
  brandName?: string | null;
  mainImageUrl?: string | null;
  createdAt: string;
}

export interface ProductDetail {
  productId: number;
  productName: string;
  price: number;
  discountedPrice?: number | null;
  discountPercent?: number | null;
  promotionType?: string | null;
  promotionSoldQuantity?: number | null;
  promotionSaleQuantity?: number | null;
  quantity: number;
  productStatus: string;
  launchDate?: string | null;
  stockThreshold: number;
  lowStockNotificationEnabled: boolean;
  lastLowStockNotifiedAt?: string | null;
  categoryId: number;
  categoryName: string;
  brandId?: number | null;
  brandName?: string | null;
  priceRangeId?: number | null;
  priceRangeMin?: number | null;
  priceRangeMax?: number | null;
  description?: string | null;
  materialId?: number | null;
  materialName?: string | null;
  ageId?: number | null;
  ageRange?: string | null;
  sexId?: number | null;
  sexName?: string | null;
  originId?: number | null;
  originName?: string | null;
  weightGram?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  mainImageUrl?: string | null;
  additionalImageUrls: string[];
  averageRating?: number | null;
  reviewCount: number;
  soldQuantity: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface LookupItem {
  id: number;
  label: string;
}

export interface CategoryLookup extends LookupItem {
  superCategoryId: number;
  superCategoryName: string;
}

export interface ProductLookups {
  superCategories: LookupItem[];
  categories: CategoryLookup[];
  brands: LookupItem[];
  priceRanges: Array<LookupItem & { min: number; max: number }>;
  materials: LookupItem[];
  ages: LookupItem[];
  sexes: LookupItem[];
  origins: LookupItem[];
}

export interface ProductFilters {
  searchTerm?: string;
  superCategoryId?: number;
  categoryId?: number;
  categoryIds?: number[];
  brandIds?: number[];
  priceRangeIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  materialIds?: number[];
  ageIds?: number[];
  sexIds?: number[];
  originIds?: number[];
  rating?: number;
}
