"use client";

import React, { useEffect, useState } from "react";
import { reviewApi } from "../services/review-api";
import { MyReviewDto, MyReviewQueryDto } from "../types/review.types";
import Link from "next/link";
import Image from "next/image";
import EditReviewModal from "./EditReviewModal";

export default function ReviewedList() {
  const [reviews, setReviews] = useState<MyReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [selectedReview, setSelectedReview] = useState<MyReviewDto | null>(
    null,
  );

  const fetchReviews = async (currentPage: number, status: string) => {
    setLoading(true);
    try {
      const query: MyReviewQueryDto = {
        pageNumber: currentPage,
        pageSize: 10,
        sortDesc: true,
      };
      if (status) {
        query.moderationStatus = status;
      }
      const res = await reviewApi.getMyReviews(query);
      setReviews(res.items);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error("Failed to fetch reviewed products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page, statusFilter);
  }, [page, statusFilter]);

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleReviewSuccess = () => {
    fetchReviews(page, statusFilter);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`material-symbols-outlined text-[20px] ${
              star <= rating ? "text-orange-400 fill-1" : "text-slate-200"
            }`}
            style={{
              fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            star
          </span>
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Approved
          </span>
        );
      case "Pending":
      case "ManualReview":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-amber-50 text-amber-600 border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
      case "Rejected":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-red-50 text-red-600 border border-red-100">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-slate-50 text-slate-500 border border-slate-100">
            {status}
          </span>
        );
    }
  };

  const isEditable = (review: MyReviewDto) => {
    if (review.isEdited) return false;
    if (review.moderationStatus !== "Approved") return false;
    if (!review.moderatedAt) return false;

    const modDate = new Date(review.moderatedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - modDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 3;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-orange-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm text-slate-500 animate-pulse font-medium">
          Loading history...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {[
          { label: "All", value: "" },
          { label: "Approved", value: "Approved" },
          { label: "Pending", value: "Pending" },
          { label: "Rejected", value: "Rejected" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleFilterChange(tab.value)}
            className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 border ${
              statusFilter === tab.value
                ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20"
                : "bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-24 h-24 mb-6 rounded-full bg-slate-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-slate-200">
              history
            </span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            You have no reviews yet
          </h3>
          <p className="text-sm text-slate-500 mt-2 max-w-[300px] mx-auto">
            Make a purchase and share your first review!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reviews.map((review) => (
            <div
              key={review.reviewId}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center border-b border-slate-100 pb-4 mb-4">
                <Link
                  href={`/products/${review.productId}`}
                  className="shrink-0"
                >
                  <div className="relative w-16 h-16 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                    {review.productImage ? (
                      <Image
                        src={review.productImage}
                        alt={review.productName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                        <span className="material-symbols-outlined text-3xl">
                          image
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-wider">
                      #{review.orderCode}
                    </span>
                  </div>
                  <Link href={`/products/${review.productId}`}>
                    <h4 className="text-base font-bold text-slate-900 hover:text-orange-600 truncate transition-colors">
                      {review.productName}
                    </h4>
                  </Link>
                </div>
                <div className="shrink-0">
                  {getStatusBadge(review.moderationStatus)}
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-end gap-4 mb-4">
                <div className="space-y-1.5">
                  {renderStars(review.rating)}
                  <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    {review.isEdited && (
                      <span className="text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded italic">
                        Edited
                      </span>
                    )}
                  </div>
                </div>

                {isEditable(review) && (
                  <button
                    onClick={() => setSelectedReview(review)}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      edit
                    </span>
                    Edit review
                  </button>
                )}
              </div>

              {review.comment && (
                <div className="relative group/comment">
                  <div className="absolute -left-3 top-0 bottom-0 w-1 bg-slate-100 rounded-full opacity-0 group-hover/comment:opacity-100 transition-opacity"></div>
                  <p className="text-sm text-slate-600 mb-4 whitespace-pre-wrap leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              )}

              {review.images && review.images.length > 0 && (
                <div className="flex flex-wrap gap-2.5 mb-4">
                  {review.images.map((img) => (
                    <div
                      key={img.reviewProductImageId}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-100 hover:border-orange-300 transition-colors cursor-pointer group/img"
                    >
                      <Image
                        src={img.imageUrl}
                        alt="Review Image"
                        fill
                        className="object-cover group-hover/img:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              )}

              {review.replies && review.replies.length > 0 && (
                <div className="mt-2 bg-slate-50 p-5 rounded-2xl border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                  {review.replies.map((reply) => (
                    <div key={reply.replyProductId} className="text-sm">
                      <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
                        <span className="material-symbols-outlined text-[18px] text-orange-500">
                          support_agent
                        </span>
                        Reply from {reply.staffName}
                      </div>
                      <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 hover:border-orange-300 transition-all text-slate-600 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-sm font-bold text-orange-600">{page}</span>
            <span className="text-xs text-slate-400 font-medium">/</span>
            <span className="text-sm font-bold text-slate-600">
              {totalPages}
            </span>
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 hover:border-orange-300 transition-all text-slate-600 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}

      {selectedReview && (
        <EditReviewModal
          isOpen={true}
          onClose={() => setSelectedReview(null)}
          review={selectedReview}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
