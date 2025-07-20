import React from 'react';

const StarRating = ({ rating }) => {
  return (
    <div className="rating">
      {[...Array(5)].map((_, i) => (
        <input key={i} type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" readOnly checked={i < rating} />
      ))}
    </div>
  );
};

export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center p-8 my-4 bg-base-200 rounded-lg">
        <p className="text-lg">No reviews yet. Be the first to leave one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {reviews.map(review => (
        <div key={review.id} className="card bg-base-100 shadow-md">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <span className="font-bold">{review.authorName} </span>
              <StarRating rating={review.rating} />
            </div>
            <p className="mt-2 text-gray-700">{review.comment}</p>
            <p className="text-xs text-gray-500 text-right mt-2">
              {review.createdAt ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}