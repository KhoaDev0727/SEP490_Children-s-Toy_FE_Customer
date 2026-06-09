"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import Image from "next/image";
import {
  CreateReviewFormValues,
  createReviewSchema,
} from "../types/review.schema";
import { reviewApi } from "../services/review-api";
import { useTracking } from "@/hooks/useTracking";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  orderId: number;
  productImage?: string;
  onSuccess: () => void;
}

// Định nghĩa kiểu dữ liệu để lưu trữ cả File gốc và URL preview tương ứng
interface SelectedImage {
  file: File;
  preview: string;
}

export default function ReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  orderId,
  productImage,
  onSuccess,
}: ReviewModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { trackReviewSubmit } = useTracking();

  // Tối ưu: Thay đổi từ File[] thành SelectedImage[] để lưu trữ URL cố định
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<CreateReviewFormValues>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      productId,
      orderId,
      rating: 5,
      comment: "",
    },
  });

  const rating = watch("rating");

  // Tối ưu: Tự động dọn dẹp bộ nhớ (revoke) khi đóng modal hoặc component unmount
  useEffect(() => {
    if (!isOpen) {
      selectedImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setSelectedImages([]);
    }
    return () => {
      selectedImages.forEach((img) => URL.revokeObjectURL(img.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const totalImages = selectedImages.length + filesArray.length;

      if (totalImages > 3) {
        toast.error("Maximum 3 images");
        e.target.value = "";
        return;
      }

      // Tối ưu: Tạo Object URL một lần duy nhất tại đây thay vì gọi trong lúc render (.map)
      const newImages = filesArray.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setSelectedImages((prev) => [...prev, ...newImages]);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => {
      // Tối ưu: Giải phóng bộ nhớ của ảnh bị xóa khỏi danh sách
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const onSubmit = async (data: CreateReviewFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("productId", data.productId.toString());
      formData.append("orderId", data.orderId.toString());
      formData.append("rating", data.rating.toString());
      if (data.comment) {
        formData.append("comment", data.comment);
      }

      // Lấy thuộc tính .file từ object để gửi lên server
      selectedImages.forEach((img) => {
        formData.append("images", img.file);
      });

      await reviewApi.createReview(formData);
      trackReviewSubmit(productId, data.rating);
      toast.success("Thank you for your review!");

      // Tối ưu: Giải phóng bộ nhớ toàn bộ ảnh sau khi submit thành công
      selectedImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setSelectedImages([]);

      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
        "An error occurred while submitting your review",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0f172a]/50 transition-all">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-auto overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 bg-slate-50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Product review</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Share your thoughts about this product
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all hover:cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          <div className="p-4 bg-slate-50 rounded-md border border-slate-100 flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-md overflow-hidden border border-slate-50 shrink-0">
              {productImage ? (
                <Image
                  src={productImage}
                  alt={productName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <span className="material-symbols-outlined text-2xl">
                    package_2
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Reviewed product
              </p>
              <h3 className="text-sm font-bold text-slate-800 truncate">
                {productName}
              </h3>
            </div>
          </div>

          <div className="text-center">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() =>
                    setValue("rating", star, { shouldValidate: true })
                  }
                  className="focus:outline-none group transition-transform active:scale-90"
                >
                  <span
                    className={`material-symbols-outlined text-[48px] transition-all duration-300 ${star <= rating
                        ? "text-[#ff4f00] drop-shadow-sm"
                        : "text-slate-200 group-hover:text-[#ff4f00]/30"
                      }`}
                    style={{
                      fontVariationSettings:
                        star <= rating ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="mt-2 text-xs text-red-500 font-medium">
                {errors.rating.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 tracking-wide flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  chat_bubble
                </span>
                Detailed comments
              </label>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Optional
              </span>
            </div>
            <textarea
              {...register("comment")}
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-4 text-sm focus:ring-2 focus:ring-[#ff4f00]/10 focus:border-[#ff4f00] outline-none transition-all resize-none placeholder:text-slate-400 text-slate-700"
              placeholder="Share what you liked about the product or service..."
            ></textarea>
            {errors.comment && (
              <p className="text-xs text-red-500 font-medium">
                {errors.comment.message}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 tracking-wide flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  add_a_photo
                </span>
                Add images
              </label>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                {selectedImages.length} / 3
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {selectedImages.map((imgObj, idx) => (
                <div
                  key={idx}
                  className="relative group/img w-20 h-20 rounded-md overflow-hidden border border-slate-200 shadow-sm animate-in zoom-in duration-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgObj.preview}
                    alt="preview"
                    className="w-full h-full object-cover transition-transform group-hover/img:scale-110"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-slate-900/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 hover:bg-red-500 transition-all duration-200"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      close
                    </span>
                  </button>
                </div>
              ))}

              {selectedImages.length < 3 && (
                <label className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-[#ff4f00]/40 hover:bg-[#ff4f00]/5 hover:text-[#ff4f00] transition-all text-slate-400">
                  <span className="material-symbols-outlined text-[24px]">
                    add_circle
                  </span>
                  <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">
                    Add image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 active:scale-95 hover:cursor-pointer bg-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-2 px-6 py-3 bg-[#ff4f00] text-white rounded-xl text-sm font-bold hover:bg-[#ff4f00]/95 transition-all shadow-md shadow-[#ff4f00]/10 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 hover:cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                Submit review
                <span className="material-symbols-outlined text-[18px]">
                  send
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}
