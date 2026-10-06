import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { reviewApi } from '../api/reviewApi';
import { toast } from 'react-hot-toast';

export default function ReviewsPage() {
  const [searchParams] = useSearchParams();
  const prefillOrderRef = searchParams.get('orderRef') || '';

  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 5.0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  // Review submission state
  const [showSubmitModal, setShowSubmitModal] = useState(!!prefillOrderRef);
  const [orderRef, setOrderRef] = useState(prefillOrderRef);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [occasion, setOccasion] = useState('Birthday Party');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewApi.getReviews({ limit: 50 });
      if (res.success) {
        setReviews(res.data || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!orderRef.trim()) {
      toast.error('Please enter your Order Reference (e.g. ORD-0001).');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a brief comment.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await reviewApi.submitReview({
        orderRef: orderRef.trim().toUpperCase(),
        rating: Number(rating),
        comment: comment.trim(),
        occasion
      });

      if (res.success) {
        toast.success('Thank you! Your review has been published.');
        setShowSubmitModal(false);
        setComment('');
        fetchReviews();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting review. Please verify your order number.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header & Stats Banner */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E8DFD3] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs uppercase font-bold tracking-widest text-[#C85A32]">Celebration Feedback</span>
            <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#2C2420]">
              Customer Reviews & Experiences
            </h1>
            <p className="text-sm text-stone-600">
              Read authentic feedback from birthday hosts, brides, event planners, and cake lovers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD3]">
              <div className="font-serif-display font-extrabold text-4xl text-[#C85A32]">
                {stats.averageRating ? stats.averageRating.toFixed(1) : '5.0'}
              </div>
              <div className="flex text-amber-400 text-sm justify-center my-1">
                {'★'.repeat(5)}
              </div>
              <p className="text-xs font-bold text-stone-500">Based on {stats.totalReviews || reviews.length} reviews</p>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-8 py-3.5 rounded-full bg-[#C85A32] text-white font-bold text-sm hover:bg-[#B04B25] shadow-lg shadow-orange-900/15 cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">rate_review</span>
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-[#C85A32] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-serif-display font-semibold text-stone-600">Loading reviews...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div key={rev._id} className="p-6 rounded-3xl bg-white border border-[#E8DFD3] shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#2C2420]">{rev.customerName}</h4>
                      <p className="text-[11px] text-[#C85A32] font-semibold">{rev.occasion || 'Celebration'}</p>
                    </div>
                    <div className="flex text-amber-400 text-sm">
                      {'★'.repeat(rev.rating)}
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed italic">
                    "{rev.comment}"
                  </p>

                  {rev.cakeName && (
                    <div className="inline-block px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E8DFD3] text-[11px] font-semibold text-stone-600">
                      🎂 {rev.cakeName}
                    </div>
                  )}
                </div>

                {/* Admin Reply */}
                {rev.adminReply?.text && (
                  <div className="p-3.5 rounded-2xl bg-[#FAECE5] border border-[#E8DFD3] text-xs text-stone-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#C85A32]">
                      <span className="material-symbols-outlined text-sm">restaurant</span>
                      <span>Bakery Chef:</span>
                    </div>
                    <p className="italic text-[11px] text-stone-700">{rev.adminReply.text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Submit Review Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 border border-[#E8DFD3] shadow-2xl space-y-6 relative">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="absolute top-6 right-6 text-stone-400 hover:text-stone-700"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>

              <div className="space-y-1 text-center">
                <span className="text-xs uppercase font-bold tracking-widest text-[#C85A32]">Verified Orders Only</span>
                <h3 className="font-serif-display text-2xl font-bold text-[#2C2420]">Review Your Cake</h3>
                <p className="text-xs text-stone-500">Share your culinary experience with our baking team.</p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Order Reference *</label>
                  <input
                    type="text"
                    value={orderRef}
                    onChange={(e) => setOrderRef(e.target.value.toUpperCase())}
                    required
                    placeholder="e.g. ORD-0001"
                    className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm uppercase font-bold bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Star Rating</label>
                  <div className="flex gap-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          rating === star
                            ? 'border-[#C85A32] bg-[#FAECE5] text-[#C85A32]'
                            : 'border-[#E8DFD3] text-stone-600 hover:bg-[#FAF7F2]'
                        }`}
                      >
                        {star} ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Celebration Occasion</label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                  >
                    <option value="Birthday Party">Birthday Party</option>
                    <option value="Wedding Reception">Wedding Reception</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Baby Shower">Baby Shower</option>
                    <option value="Graduation">Graduation</option>
                    <option value="Corporate Event">Corporate Event</option>
                    <option value="Personal Treat">Personal Treat</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Your Review Comment *</label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    placeholder="How was the sponge texture, flavor balance, decoration, and delivery experience?..."
                    className="w-full p-3 rounded-xl border border-[#E8DFD3] text-xs bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-full bg-[#C85A32] text-white font-bold text-sm hover:bg-[#B04B25] shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Publishing Review...' : 'Publish Review'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
