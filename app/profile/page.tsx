// app/profile/page.tsx (CORRECTED)

"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";

// Interface for Tutor Profile Data
interface TutorProfileData {
  name: string;
  bio: string;
  classes: string;
}

export default function TutorSetupPage() {
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [formData, setFormData] = useState<TutorProfileData>({
    name: "",
    bio: "",
    classes: "",
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.error("You must be logged in to access this page.");
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      const tutorDocRef = doc(db, "tutors", user.uid);
      const docSnap = await getDoc(tutorDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          name: data.name || "",
          bio: data.bio || "",
          classes: (data.classes || []).join(", "),
        });
      }
      setPageLoading(false);
    };

    fetchProfile();
  }, [user, authLoading, router]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading("Saving your profile...");

    const tutorDocRef = doc(db, "tutors", user.uid);

    const profileDataToSave = {
      name: formData.name,
      bio: formData.bio,
      classes: formData.classes.split(",").map((c) => c.trim()).filter(Boolean),
      email: user.email,
    };

    try {
      await setDoc(tutorDocRef, profileDataToSave, { merge: true });

      const docSnap = await getDoc(tutorDocRef);
      if (!docSnap.data()?.hasOwnProperty("rating")) {
        await setDoc(
          tutorDocRef,
          {
            rating: 0,
            numRatings: 0,
            createdAt: new Date(),
          },
          { merge: true },
        );
      }

      toast.dismiss(loadingToast);
      toast.success("Profile saved successfully!");
      router.push(`/tutors/${user.uid}`);
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(`Failed to save profile: ${errorMessage}`);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading || authLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-3xl">Your Tutor Profile</h1>
          <p>This information will be visible to students seeking help.</p>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* --- NAME FIELD FIX --- */}
            <div className="form-control">
              <label htmlFor="name" className="label"> {/* FIX: Added htmlFor="name" */}
                <span className="label-text">Full Name</span>
              </label>
              <input
                id="name" // FIX: Added id="name"
                type="text"
                name="name"
                placeholder="e.g., Alex Tan"
                className="input input-bordered"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* --- BIO FIELD FIX --- */}
            <div className="form-control">
              <label htmlFor="bio" className="label"> {/* FIX: Added htmlFor="bio" */}
                <span className="label-text">Bio</span>
              </label>
              <textarea
                id="bio" // FIX: Added id="bio"
                name="bio"
                className="textarea textarea-bordered h-24"
                placeholder="Tell students about your teaching style, your academic achievements, and why you're a great tutor."
                required
                value={formData.bio}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* --- CLASSES FIELD FIX --- */}
            <div className="form-control">
              <label htmlFor="classes" className="label"> {/* FIX: Added htmlFor="classes" */}
                <span className="label-text">Classes Taught</span>
              </label>
              <input
                id="classes" // FIX: Added id="classes"
                type="text"
                name="classes"
                placeholder="e.g., Algebra, Calculus, Physics"
                className="input input-bordered"
                required
                value={formData.classes}
                onChange={handleChange}
              />
              {/* This label is informational and doesn't need an association, so it's fine as is. */}
              <label className="label">
                <span className="label-text-alt">
                  Separate class names with a comma (,)
                </span>
              </label>
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Save Profile"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}