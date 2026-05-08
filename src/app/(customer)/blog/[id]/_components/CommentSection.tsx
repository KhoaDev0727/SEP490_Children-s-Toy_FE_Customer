"use client";

import { useMemo, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { customerBlogApi } from "@/features/blog/services/blog-api";
import { BlogReview, BlogReviewReply } from "@/features/blog/types/blog";

interface CommentSectionProps {
  blogPostId: number;
  comments: BlogReview[];
  onReload: () => Promise<void>;
}

const toTimeText = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(date);
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "NA";
  }
  return parts.slice(-2).map((part) => part[0]?.toUpperCase() ?? "").join("");
};

export default function CommentSection({ blogPostId, comments, onReload }: CommentSectionProps) {
  const { account, isAuthenticated } = useAuthContext();
  const [newComment, setNewComment] = useState("");
  const [replyTarget, setReplyTarget] = useState<{ reviewBlogId: number; parentReplyId?: number; replyToAccountId?: number; label: string } | null>(null);
  const [replyComment, setReplyComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = newComment.trim().length > 0 && newComment.trim().length <= 500;

  const totalReplies = useMemo(() => comments.reduce((sum, item) => sum + item.replies.length, 0), [comments]);

  const handleCreateReview = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      await customerBlogApi.createBlogReview(blogPostId, newComment.trim());
      setNewComment("");
      await onReload();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewBlogId: number) => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      await customerBlogApi.removeBlogReview(reviewBlogId);
      await onReload();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!replyTarget || !replyComment.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await customerBlogApi.createBlogReviewReply(replyTarget.reviewBlogId, {
        comment: replyComment.trim(),
        parentReplyId: replyTarget.parentReplyId ?? null,
        replyToAccountId: replyTarget.replyToAccountId ?? null,
      });
      setReplyComment("");
      setReplyTarget(null);
      await onReload();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReply = (reviewBlogId: number, reply: BlogReviewReply, depth: number) => (
    <div key={reply.replyBlogId} className="mt-3" style={{ marginLeft: `${Math.min(depth, 4) * 24}px` }}>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[11px]">
          {getInitials(reply.accountName)}
        </div>
        <div className="flex-1 rounded-xl border border-[#f3e3d7] bg-white p-3">
          <p className="text-sm font-semibold text-[#261812]">{reply.accountName}</p>
          <p className="text-xs text-[#8e7164] mt-0.5">{toTimeText(reply.createdAt)}</p>
          <p className="text-sm text-[#5a4136] mt-2">
            {reply.replyToAccountName ? <span className="font-medium text-[#7f4a2a]">@{reply.replyToAccountName} </span> : null}
            {reply.comment}
          </p>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setReplyTarget({ reviewBlogId, parentReplyId: reply.replyBlogId, replyToAccountId: reply.accountId, label: `Reply ${reply.accountName}` })}
              className="mt-2 text-xs font-medium text-[#c2410c] hover:underline"
            >
              Reply
            </button>
          )}
        </div>
      </div>
      {reply.replies.map((child) => renderReply(reviewBlogId, child, depth + 1))}
    </div>
  );

  return (
    <section className="flex flex-col gap-4">
      <h3 className="font-bold text-xl text-[#261812]">Comments ({comments.length + totalReplies})</h3>

      {isAuthenticated && (
        <div className="rounded-xl border border-[#f8ddd2] bg-white p-3">
          <textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Write your review..."
            className="w-full resize-none rounded-lg border border-[#f1ddd2] px-3 py-2 text-sm outline-none focus:border-[#c2410c]"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-[#8e7164]">{newComment.length}/500</span>
            <button type="button" onClick={handleCreateReview} disabled={!canSubmit || isSubmitting} className="rounded-lg bg-[#c2410c] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
              Add Review
            </button>
          </div>
        </div>
      )}

      {replyTarget && (
        <div className="rounded-xl border border-[#f8ddd2] bg-[#fff7f2] p-3">
          <p className="text-xs font-medium text-[#9a3412] mb-2">{replyTarget.label}</p>
          <textarea
            value={replyComment}
            onChange={(event) => setReplyComment(event.target.value)}
            maxLength={500}
            rows={2}
            className="w-full resize-none rounded-lg border border-[#f1ddd2] px-3 py-2 text-sm outline-none focus:border-[#c2410c]"
          />
          <div className="mt-2 flex items-center gap-2 justify-end">
            <button type="button" onClick={() => setReplyTarget(null)} className="text-xs text-slate-600">Cancel</button>
            <button type="button" onClick={handleReply} disabled={!replyComment.trim() || isSubmitting} className="rounded-lg bg-[#c2410c] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Reply</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {comments.map((comment) => (
          <div key={comment.reviewBlogId} className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
              {getInitials(comment.accountName)}
            </div>
            <div className="flex-1 rounded-xl border border-[#f8ddd2] bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#261812]">{comment.accountName}</p>
                  <p className="text-xs text-[#8e7164] mt-0.5">{toTimeText(comment.createdAt)}</p>
                </div>
                {account?.accountId === comment.accountId && (
                  <button type="button" onClick={() => handleDeleteReview(comment.reviewBlogId)} className="text-xs text-red-600 hover:underline">Delete</button>
                )}
              </div>
              <p className="text-sm text-[#5a4136] mt-2">{comment.comment}</p>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setReplyTarget({ reviewBlogId: comment.reviewBlogId, replyToAccountId: comment.accountId, label: `Reply ${comment.accountName}` })}
                  className="mt-2 text-xs font-medium text-[#c2410c] hover:underline"
                >
                  Reply
                </button>
              )}
              {comment.replies.map((reply) => renderReply(comment.reviewBlogId, reply, 1))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
