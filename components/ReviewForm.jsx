'use client';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from "@/config/firebase";
import toast from 'react-hot-toast';

export default function ReviewForm({ tutorId, onReviewAdded }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      toast.error("You must be logged in to leave a review.");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Review must be at least 10 characters long.");
      return;
    }
    
    setIsSubmitting(true);
    const loadingToast = toast.loading("Submitting your review...");

    try {
      const newReviewData = {
        tutorId: tutorId,
        authorId: currentUser.uid,
        authorName: 'Anonymous Student',
        comment: comment,
        rating: Number(rating),
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'reviews'), newReviewData);
      
      // Optimistically update the UI
      onReviewAdded({ id: docRef.id, ...newReviewData });

      toast.dismiss(loadingToast);
      toast.success("Review submitted successfully!");
      setComment('');
      setRating(5);
    } catch (error) {
      console.error("Error adding review: ", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to submit review. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="my-6 p-6 card bg-base-200 shadow">
      <h3 className="text-xl font-bold mb-4">Leave a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Rating</label>
          <div className="rating rating-lg">
            {[1, 2, 3, 4, 5].map(star => (
              <input 
                key={star} 
                type="radio" 
                name="rating-9" 
                className="mask mask-star-2 bg-orange-400"
                value={star}
                checked={rating === star}
                onChange={(e) => setRating(parseInt(e.target.value))}
              />
            ))}
          </div>
        </div>
        <div>
          <label className="label">Comment</label>
          <textarea 
            className="textarea textarea-bordered w-full h-24" 
            placeholder="Share your experience with this tutor..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}