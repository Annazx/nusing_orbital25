import React from 'react';
import { Card, CardBody, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

const StarRating = ({ rating }) => {
  return (
     <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Icon
          key={i}
          icon="material-symbols:star" 
          className={`h-5 w-5 transition-colors ${
            i < rating ? "text-warning" : "text-default-300"
          }`}
        />
      ))}
    </div>
  );
};


export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <Card className="my-4">
        <CardBody className="text-center">
          <p className="text-lg">No reviews yet. Be the first to leave one!</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {reviews.map(review => (
        <Card key={review.id} className="shadow-sm">
          <CardBody>
           <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{review.authorName} </span>
              </div>
            </div>
            <p className="text-xs text-default-400 text-right">
              {review.createdAt ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
            </p>
            <div className="flex items-center gap-2">
              {/* 1. Display the numeric rating, formatted to one decimal place */}
              <span className="font-bold text-lg text-default-700">
                {Number(review.rating).toFixed(1)}
              </span>
              {/* 2. Display the star rating component */}
                <StarRating rating={review.rating} />
            </div>
            <p className="mt-2 text-default-600">{review.comment}</p>
          </CardBody>         
        </Card>
      ))}
    </div>
  );
}