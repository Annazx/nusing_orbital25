'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from "../../../config/firebase";
import toast from 'react-hot-toast';

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
        console.error(err);
        setError('Failed to load tutor data.');
        toast.error('Failed to load data. Please try again.');
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
    return <div className="text-center py-20"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500 font-bold">{error}</div>;
  }

  if (!tutor) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tutor Info Card */}
      <div className="card lg:card-side bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h1 className="card-title text-4xl">{tutor.name || 'Anonymous Tutor'}</h1>
          {/* FIX: Use 'preferredRate' field */}
          <p className="text-2xl font-light text-primary">${tutor.preferredRate || 'N/A'}/hr</p>          
          {/* FIX: Use 'bio' field */}
          <p className="mt-4">{tutor.bio || 'This tutor has not provided a biography yet.'}</p>
          <div className="my-4">
            <h3 className="font-bold text-lg">Modules Taught:</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {tutor.modules?.map(mod => (
                <div key={mod} className="badge badge-lg badge-secondary">{mod}</div>
              ))}
            </div>
          </div>
          
          <div className="card-actions justify-end">
            <Link href={`/chat/${tutor.id}`} className="btn btn-primary">
              Chat with {tutor.name.split(' ')[0]}
            </Link>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="divider">STUDENT REVIEWS</div>
      
      {/* Form to add a new review */}
      {/* <ReviewForm tutorId={tutor.id} onReviewAdded={handleReviewAdded} /> */}

      {/* List of existing reviews */}
      {/*<ReviewList reviews={reviews} /> */}
    </div>
  );
}
