'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from "../../../config/firebase";
import toast from 'react-hot-toast';
import { Card, CardBody, CardHeader, Avatar, Chip, Button, Divider, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";

import ReviewList from '../../../components/ReviewList';
import ReviewForm from '../../../components/ReviewForm';

export default function TutorProfilePage() {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tutorId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Tutor Profile
        const tutorDocRef = doc(db, 'users', tutorId);
        const tutorDocSnap = await getDoc(tutorDocRef);

        if (tutorDocSnap.exists()) {
          setTutor({ id: tutorDocSnap.id, ...tutorDocSnap.data() });
        } else {
          setError('Tutor not found.');
          toast.error('Tutor not found.');
          return;
        }

        // 2. Fetch Reviews for this Tutor
        const reviewsQuery = query(collection(db, 'reviews'), where('tutorId', '==', tutorId));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsData = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReviews(reviewsData);

      } catch (err) {
        console.error("Data fetching error:",err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tutorId]);
  
  // Function to add a new review to the list without re-fetching
  const handleReviewAdded = (newReview) => {
    setReviews(prevReviews => [newReview, ...prevReviews]);
  }

  if (loading) {
    return(
    <div className="flex justify-center items-center h-screen">
      <Spinner size = "lg" color = "primary" />
    </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-500 font-bold">{error}</div>;
  }

  if (!tutor) {
    return <div className="text-center py-20 text-danger">Tutor not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Tutor Info Card */}
      <Card className="shadow-md mb-8">
        <CardHeader className="flex gap-4">
          <div className = "flex flex-col">
            <h1 className="text-2xl font-bold">{tutor.name || 'Anonymous Tutor'}</h1>
            <p className="text-xl font-light text-primary">${tutor.preferredRate || 'N/A'}/hr</p>          
          </div>
        </CardHeader>
        <CardBody>
          <p className="mb-4">{tutor.bio || 'This tutor has not provided a biography yet.'}</p>
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-2">Modules Taught:</h3>
            <div className="flex flex-wrap gap-2">
              {tutor.modules?.map(mod => (
                <Chip key={mod} variant="flat" color="secondary">{mod}</Chip>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              color="primary"
              endContent={<Icon icon="lucide:message-circle" />}
              as="a"
              href={`/chat/${tutor.id}`}
            >
              Chat with {tutor.name.split(' ')[0]}
            </Button>
          </div> 
        </CardBody>
      </Card>

      {/* Reviews Section */}
      <Divider className="my-8"/>
      <h2 className="text-2x1 font-bold mb-6 text-center">Student Reviews</h2>
      
      {/* Form to add a new review */}
      <ReviewForm tutorId={tutor.id} onReviewAdded={handleReviewAdded} /> 

      {/* List of existing reviews */}
      <ReviewList reviews={reviews} />
    </div>
  );
}
