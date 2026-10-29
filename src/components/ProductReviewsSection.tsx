'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Star, CheckCircle2, Trash2, Plus, MessageSquare, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ProductReview, Product } from '@/types';

interface ProductReviewsSectionProps {
  product: Product;
}

export default function ProductReviewsSection({ product }: ProductReviewsSectionProps) {
  const { customer } = useAuth();

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [averageRating, setAverageRating] = useState<number>(5.0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<Record<number, number>>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Review form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState(customer?.name || '');
  const [authorPhone, setAuthorPhone] = useState(customer?.phone || '');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load reviews from API
  const loadReviews = useCallback(async () => {
    if (!product?.id) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/reviews?product_id=${encodeURIComponent(product.id)}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        setTotalCount(data.count || 0);
        setAverageRating(data.average_rating || 5.0);
        setBreakdown(data.rating_breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      }
    } catch (err) {
      console.warn('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, [product?.id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (customer) {
      setAuthorName(prev => prev || customer.name || '');
      setAuthorPhone(prev => prev || customer.phone || '');
    }
  }, [customer]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      setErrorMsg('Please enter your name');
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 5) {
      setErrorMsg('Please write a review comment (minimum 5 characters)');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          customer_name: authorName.trim(),
          customer_phone: authorPhone.trim() || undefined,
          rating,
          title: reviewTitle.trim() || undefined,
          comment: reviewComment.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Thank you! Your verified farm review has been posted.');
        setReviewTitle('');
        setReviewComment('');
        await loadReviews();
        setTimeout(() => {
          setIsFormOpen(false);
          setSuccessMsg(null);
        }, 1500);
      } else {
        setErrorMsg(data.error || 'Failed to submit review');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error while submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this rating and review?')) return;
    try {
      const res = await fetch(`/api/reviews?id=${encodeURIComponent(reviewId)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        await loadReviews();
      } else {
        alert(data.error || 'Failed to delete review');
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Product Reviews</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Customer Reviews for {product.title} ({totalCount})
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Ratings and feedback submitted by verified buyers exclusively for this commodity
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1e824c] hover:bg-[#16663b] text-white font-bold text-xs shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Rate &amp; Review This Product</span>
        </button>
      </div>

      {/* Ratings Summary & Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-stone-100 items-center">
        {/* Big Average Score */}
        <div className="text-center md:border-r md:border-stone-100 md:pr-6">
          <div className="text-5xl font-black text-stone-900 tracking-tight font-mono">
            {averageRating}
          </div>
          <div className="flex items-center justify-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-5 h-5 ${
                  s <= Math.round(averageRating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-stone-300'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-stone-500 font-medium">
            Based on {totalCount} authentic buyer review{totalCount === 1 ? '' : 's'}
          </p>
        </div>

        {/* 5-Star Distribution Bars */}
        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = breakdown[star] || 0;
            const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-8 font-bold text-stone-700 font-mono text-right flex items-center justify-end gap-0.5">
                  {star} <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-12 text-stone-500 font-mono text-right">{count} ({percentage}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="pt-6">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-stone-400">Loading verified buyer reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <MessageSquare className="w-8 h-8 text-stone-300 mx-auto" />
            <h4 className="text-sm font-bold text-stone-800">No reviews yet for this lot</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Be the first to share your experience with this direct farm commodity!
            </p>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="text-xs font-bold text-[#1e824c] hover:underline"
            >
              Write First Review →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 space-y-5">
            {reviews.map((rev) => (
              <div key={rev.id} className="pt-5 first:pt-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {/* Stars & Title */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-stone-200'
                            }`}
                          />
                        ))}
                      </div>
                      {rev.title && (
                        <h4 className="text-sm font-bold text-stone-900">{rev.title}</h4>
                      )}
                    </div>

                    {/* Author & Verification Badge */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                      <span className="font-bold text-stone-800">{rev.customer_name}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Buyer
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(rev.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Comment Body */}
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-2.5">
                      {rev.comment}
                    </p>
                  </div>

                  {/* Option to Delete Rating if necessary */}
                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(rev.id)}
                      className="p-1.5 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete this review (Admin Moderation)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsFormOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <h3 className="text-xl font-black text-stone-900 tracking-tight">
                Rate &amp; Review This Produce
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {product.title}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 mb-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold text-center">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Picker */}
              <div className="text-center py-2 bg-stone-50 rounded-2xl border border-stone-200">
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  Overall Rating *
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-[11px] font-bold text-amber-800 mt-1">
                  {rating === 5
                    ? '5.0 — Excellent Farm Quality'
                    : rating === 4
                    ? '4.0 — Very Good Produce'
                    : rating === 3
                    ? '3.0 — Average Standard'
                    : rating === 2
                    ? '2.0 — Needs Improvement'
                    : '1.0 — Poor Lot'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Sharath or Ramesh"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-[#1e824c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={authorPhone}
                    onChange={(e) => setAuthorPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9008462568"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-[#1e824c] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Crisp moisture level, pristine packing"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-[#1e824c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Detailed Experience &amp; Comments *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about kernel quality, weight grading, packaging, or delivery..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-[#1e824c] focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#1e824c] hover:bg-[#16663b] text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting Review...' : 'Submit Farm Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
