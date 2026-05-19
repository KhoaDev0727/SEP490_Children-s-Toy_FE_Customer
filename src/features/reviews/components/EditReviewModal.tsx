"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import Image from "next/image";
import {
  UpdateReviewFormValues,
  updateReviewSchema,
} from "../types/review.schema";
import { reviewApi } from "../services/review-api";
import { MyReviewDto } from "../types/review.types";

interface EditReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: MyReviewDto;
  onSuccess: () => void;
}

interface SelectedImage {
  file: File;
  preview: string;
}

export default function EditReviewModal({
  isOpen,
  onClose,
  review,
  onSuccess,
}: EditReviewModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateReviewFormValues>({
    resolver: zodResolver(updateReviewSchema),
    defaultValues: {
      rating: review.rating,
      comment: review.comment || "",
    },
  });

  const rating = watch("rating") || 5;

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

  useEffect(() => {
    if (isOpen) {
      setValue("rating", review.rating);
      setValue("comment", review.comment || "");
    }
  }, [isOpen, review, setValue]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const totalImages = selectedImages.length + filesArray.length;
      if (totalImages > 3) {
        toast.error("Maximum 3 images");
        return;
      }

      const newImages = filesArray.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setSelectedImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const imgObj = selectedImages[index];
    if (imgObj) {
      URL.revokeObjectURL(imgObj.preview);
    }
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: UpdateReviewFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (data.rating) formData.append("rating", data.rating.toString());
      if (data.comment !== undefined) {
        formData.append("comment", data.comment);
      }

      // Lấy thuộc tính .file từ object để gửi lên server
      selectedImages.forEach((img) => {
        formData.append("images", img.file);
      });

      await reviewApi.updateReview(review.reviewId, formData);
      toast.success("Review updated!");

      // Dọn dẹp bộ nhớ sau khi cập nhật thành công
      selectedImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setSelectedImages([]);

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
        "An error occurred while updating the review",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 transition-all">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl mx-auto overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 bg-linear-to-r from-blue-50/50 to-white shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit review</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your experience
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
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-50 shrink-0">
              {review.productImage ? (
                <Image
                  src={review.productImage}
                  alt={review.productName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined text-2xl">
                    history_edu
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Reviewed product
              </p>
              <h3 className="text-sm font-bold text-slate-800 truncate">
                {review.productName}
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
                        ? "text-orange-400 drop-shadow-sm"
                        : "text-slate-200 group-hover:text-orange-200"
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
            <label className="text-sm font-bold text-slate-700 tracking-wide flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-400">
                edit_note
              </span>
              Your comments
            </label>
            <textarea
              {...register("comment")}
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-400 text-slate-700"
              placeholder="Review content..."
            ></textarea>
            {errors.comment && (
              <p className="text-xs text-red-500 font-medium">
                {errors.comment.message}
              </p>
            )}
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
            <span className="material-symbols-outlined text-amber-500 shrink-0">
              info
            </span>
            <p className="text-[11px] leading-relaxed text-amber-800 font-medium">
              <strong>Important note:</strong> Updating the review will replace
              all old images. If you want to keep them, please upload them again
              below.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 tracking-wide flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  upload_file
                </span>
                Upload new images
              </label>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                {selectedImages.length} / 3
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {selectedImages.map((imgObj, idx) => (
                <div
                  key={idx}
                  className="relative group/img w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shadow-sm animate-in zoom-in duration-200"
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
                <label className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 hover:text-blue-600 transition-all text-slate-400">
                  <span className="material-symbols-outlined text-[24px]">
                    add_photo_alternate
                  </span>
                  <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">
                    Choose image
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
        <div className="px-8 py-6 border-t border-slate-100 bg-slate-100 flex gap-4 shrink-0">
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
            className="flex-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 hover:cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                Save changes
                <span className="material-symbols-outlined text-[18px]">
                  done_all
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
