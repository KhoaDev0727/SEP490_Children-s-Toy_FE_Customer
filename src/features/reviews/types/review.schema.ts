import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.number(),
  orderId: z.number(),
  rating: z.number().min(1, "Vui lòng chọn số sao").max(5),
  comment: z.string().max(500, "Đánh giá không được vượt quá 500 ký tự").optional(),
  images: z.any().optional(), // File[] or FileList
});

export type CreateReviewFormValues = z.infer<typeof createReviewSchema>;

export const updateReviewSchema = z.object({
  rating: z.number().min(1, "Vui lòng chọn số sao").max(5).optional(),
  comment: z.string().max(500, "Đánh giá không được vượt quá 500 ký tự").optional(),
  images: z.any().optional(),
  isDeleted: z.boolean().optional(),
});

export type UpdateReviewFormValues = z.infer<typeof updateReviewSchema>;
