'use client';
import React from "react";
import { Card, CardBody, Textarea, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, getDoc, runTransaction } from 'firebase/firestore';
import { db, auth } from "@/config/firebase";
import toast from 'react-hot-toast';

export default function ReviewForm({ tutorId, onReviewAdded }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);


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
      await runTransaction(db, async (transaction) => {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const tutorDocRef = doc(db, 'users', tutorId);
        const userDocSnap = await getDoc(userDocRef);
        let authorName = 'Anonymous Student'; 
        if (userDocSnap.exists()) {
          authorName = userDocSnap.data().name || 'Anonymous Student';
        }
        const newReviewRef = doc(collection(db, 'reviews'));
        const tutorDoc = await transaction.get(tutorDocRef);
        if (!tutorDoc.exists()) {
          throw "Tutor document does not exist!";
        }

        const currentData = tutorDoc.data();
        const newNumRatings = (currentData.numRatings || 0) + 1;
        const newTotalRating = (currentData.rating || 0) + Number(rating);
        
        transaction.update(tutorDocRef, {
          numRatings: newNumRatings,
          rating: newTotalRating,
        });

      const newReviewData = {
        tutorId: tutorId,
        authorId: currentUser.uid,
        authorName: authorName,
        comment: comment,
        rating: Number(rating),
        createdAt: serverTimestamp(),
      };
      transaction.set(newReviewRef, newReviewData);

      onReviewAdded({id:newReviewRef.id,...newReviewData, createdAt: new Date() });
    });

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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block test-sm font-medium mb-2">Rating</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <Button
                    key={star}
                    type="button" 
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none focus:ring-2 focus:ring-warning focus:ring-offset-2 rounded-full"
                    aria-label={`Rate ${star} out of 5 stars`}
                  >
                  <Icon
                      icon={isFilled ? "solar:star-bold" : "solar:star-bold"}
                      className={`h-7 w-7 transition-colors ${
                        isFilled ? "text-warning" : "text-default-300"
                      }`}
                    />
                </Button>
              );
            })}
          </div>
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
            className="w-full"
          >
            {isSubmitting ? 'Submitting...':'Submit Review'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}