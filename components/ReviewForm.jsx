'use client';
import React from "react";
import { Card, CardBody, Textarea, Button, RadioGroup, Radio } from "@heroui/react";
import { Icon } from "@iconify/react";
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
    <Card className="my-6 shadow-sm">
      <CardBody>
        <h3 className="text-xl font-bold mb-4">Leave a Review</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block test-sm font-medium mb-2">Rating</label>
            <RadioGroup
            orientation="horizontal"
            value={rating}
            onValueChange={setRating}
            >
              {[1,2,3,4,5].map(star => (
                <Radio
                key={star}
                value={star.toString()}
                className="inline-flex items-center mr-4"
                >
                  {({isSelected}) => (
                    <Icon
                    icon={isSelected ? "lucide:star-full":"lucide:star"}
                    className={isSelected ? "text-warning":"text-default-300"}
                    width={24}
                    height={24}
                    />
                  )}
                </Radio>
              ))}
            </RadioGroup>
          </div>
          <Textarea
            label="Comment"
            placeholder="Share your experience with this tutor..."
            value={comment}
            onValueChange={setComment}
            minRows={3}
            isRequired
          />
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Submitting...':'Submit Review'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}