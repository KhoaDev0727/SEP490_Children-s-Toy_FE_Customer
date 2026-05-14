import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.number(),
  orderId: z.number(),
  rating: z.number().min(1, "Please select a star rating").max(5),
  comment: z.string().max(500, "Review cannot exceed 500 characters").optional(),
  images: z.any().optional(), // File[] or FileList
});

export type CreateReviewFormValues = z.infer<typeof createReviewSchema>;

export const updateReviewSchema = z.object({
  rating: z.number().min(1, "Please select a star rating").max(5).optional(),
  comment: z.string().max(500, "Review cannot exceed 500 characters").optional(),
  images: z.any().optional(),
  isDeleted: z.boolean().optional(),
});

export type UpdateReviewFormValues = z.infer<typeof updateReviewSchema>;
