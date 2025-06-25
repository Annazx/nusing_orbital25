// app/tutors/me/setup/page.tsx (REVISED)

'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

// Updated interface to match your Firestore 'tutors' collection
interface TutorProfileData {
  name: string; // Added this essential field
  bio: string;
  classes: string; // Handled as a comma-separated string in the form
}

export default function TutorSetupPage() {
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // State now matches the new interface
  const [formData, setFormData] = useState<TutorProfileData>({
    name: '',
    bio: '',
    classes: '',
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.error("You must be logged in to access this page.");
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      // We now fetch from the 'tutors' collection
      const tutorDocRef = doc(db, 'tutors', user.uid);
      const docSnap = await getDoc(tutorDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Pre-fill form with existing data from the 'tutors' collection
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          classes: (data.classes || []).join(', '), // Join array to string for input field
        });
      }
      setPageLoading(false);
    };

    fetchProfile();
  }, [user, authLoading, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading('Saving your profile...');

    const tutorDocRef = doc(db, 'tutors', user.uid);

    // Prepare data structure to match your schema exactly
    const profileDataToSave = {
      name: formData.name,
      bio: formData.bio,
      classes: formData.classes.split(',').map(c => c.trim()).filter(Boolean),
      email: user.email, // Get email from the authenticated user object
    };

    try {
      // Use setDoc with { merge: true }
      // This will CREATE the document if it doesn't exist,
      // or UPDATE the fields if it already exists.
      // It's perfect for both initial setup and future edits.
      await setDoc(tutorDocRef, profileDataToSave, { merge: true });

      // If the document is being created for the first time, initialize ratings.
      const docSnap = await getDoc(tutorDocRef);
      if (!docSnap.data()?.hasOwnProperty('rating')) {
        await setDoc(tutorDocRef, {
          rating: 0,
          numRatings: 0,
          createdAt: new Date(),
        }, { merge: true });
      }

      toast.dismiss(loadingToast);
      toast.success('Profile saved successfully!');
      router.push(`/tutors/${user.uid}`);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to save profile.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading || authLoading) {
    return <div className="text-center py-10"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-3xl">Your Tutor Profile</h1>
          <p>This information will be visible to students seeking help.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Full Name</span></label>
              {/* Field name changed to 'name' */}
              <input type="text" name="name" placeholder="e.g., Alex Tan" className="input input-bordered" required value={formData.name} onChange={handleChange} />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Bio</span></label>
              {/* Field name changed to 'bio' */}
              <textarea name="bio" className="textarea textarea-bordered h-24" placeholder="Tell students about your teaching style, your academic achievements, and why you're a great tutor." required value={formData.bio} onChange={handleChange}></textarea>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Classes Taught</span></label>
              {/* Field name changed to 'classes' */}
              <input type="text" name="classes" placeholder="e.g., Algebra, Calculus, Physics" className="input input-bordered" required value={formData.classes} onChange={handleChange} />
              <label className="label"><span className="label-text-alt">Separate class names with a comma (,)</span></label>
            </div>

            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <span className="loading loading-spinner"></span> : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}