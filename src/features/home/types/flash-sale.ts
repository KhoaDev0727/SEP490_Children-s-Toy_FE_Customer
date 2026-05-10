// ========================================
// Flash Sale – TypeScript Interfaces
// Ánh xạ với backend DTOs (camelCase theo JSON serializer)
// ========================================

export interface FlashSaleProduct {
  slotProductId: number;
  timeSlotId: number;
  productId: number;
  productName: string;
  mainImageUrl?: string | null;
  originalPrice: number;
  salePrice: number;
  discountPercent?: number | null;
  saleQuantity: number;
  soldQuantity: number;
  reservedQuantity: number;
  isActive: boolean;
}

export interface FlashSaleTimeSlot {
  timeSlotId: number;
  promotionId: number;
  startAt: string; // ISO UTC string
  endAt: string;   // ISO UTC string
  status: "Scheduled" | "Active" | "Expired" | "Inactive" | string;
  promotionProductSlots: FlashSaleProduct[];
}

export interface FlashSalePromotion {
  promotionId: number;
  promotionName: string;
  promotionType: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  status: string;
  priority: number;
  createdAt: string;
  updatedAt?: string | null;
  promotionTimeSlots: FlashSaleTimeSlot[];
}

// ----------------------------------------
// Helper types dùng nội bộ trong hook
// ----------------------------------------

/** Đại diện cho một ngày (YYYY-MM-DD) trong Flash Sale */
export type FlashSaleDate = string;

/** Trạng thái của một time slot tính theo real-time */
export type SlotRuntimeStatus = "active" | "upcoming" | "expired";
