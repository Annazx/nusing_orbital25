"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

interface TutorProfileData {
  name: string;
  bio: string;
  modules: string; 
  preferredRate: string;
}

export default function TutorSetupPage() {
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [formData, setFormData] = useState<TutorProfileData>({
    name: "",
    bio: "",
    modules: "", 
    preferredRate: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.error("You must be logged in.");
      router.push("/login"); 
      return;
    }

    const fetchProfile = async () => {
      const userDocRef = doc(db, "users", user.uid); 
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          name: data.name || "",
          bio: data.bio || "",
          modules: (data.modules || []).join(", "), 
          preferredRate: data.preferredRate || "",
        });
      }
      setPageLoading(false);
    };

    fetchProfile();
  }, [user, authLoading, router]);

  const handleChange = ( e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    const loadingToast = toast.loading("Saving profile...");

    const userDocRef = doc(db, "users", user.uid); 

    const profileDataToSave = {
      name: formData.name,
      bio: formData.bio,
      modules: formData.modules.split(",").map((m) => m.trim()).filter(Boolean), // FIX: Use 'modules'
      preferredRate: Number(formData.preferredRate) || 0,
      email: user.email,
      role: 'tutor', 
      profileComplete: true,
    };

    try {
      await setDoc(userDocRef, profileDataToSave, { merge: true });
      
      // Initialize rating if it doesn't exist. 
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.data()?.hasOwnProperty("numRatings")) {
        await setDoc(userDocRef, { rating: 0, numRatings: 0, createdAt: serverTimestamp() }, { merge: true });
      }

      toast.dismiss(loadingToast);
      toast.success("Profile saved successfully!");
      router.push(`/modules`); // FIX: Redirect to the main listing page
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : "Unknown error.";
      toast.error(`Failed to save profile: ${errorMessage}`);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading || authLoading) {
    return <div className="flex justify-center items-center py-10"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-3xl">Your Tutor Profile</h1>
          <p>This information will be visible to students seeking help.</p>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* NAME FIELD */}
            <div className="form-control">
              <label htmlFor="name" className="label"> 
                <span className="label-text">Full Name</span>
              </label>
              <input
                id="name" 
                type="text"
                name="name"
                placeholder="e.g., Alex Tan"
                className="input input-bordered"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* BIO FIELD */}
            <div className="form-control">
              <label htmlFor="bio" className="label"> 
                <span className="label-text">Bio</span>
              </label>
              <textarea
                id="bio" 
                name="bio"
                className="textarea textarea-bordered h-24"
                placeholder="Tell students about your teaching style, your academic achievements, and why you're a great tutor."
                required
                value={formData.bio}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* PREFERRED RATE FIELD */}
            <div className="form-control">
              <label htmlFor="preferredRate" className="label">
                <span className="label-text">Preferred Rate ($/hr)</span>
              </label>
              <input
                id="preferredRate"
                type="number" 
                name="preferredRate"
                placeholder="e.g., 25"
                className="input input-bordered"
                required
                value={formData.preferredRate}
                onChange={handleChange}
                min="0" 
              />
            </div>

            {/* CLASSES FIELD */}
            <div className="form-control">
              <label htmlFor="modules" className="label"> 
                <span className="label-text">Modules Taught</span>
              </label>

              <div className = "flex flex-col">
                <input
                  id="modules" 
                  type="text"
                  name="modules"
                  placeholder="e.g.CS2040S, MA1521"
                  className="input input-bordered"
                  required
                  value={formData.modules}
                  onChange={handleChange}
                />
                <span className = "label-text-alt mt-1">
                  Separate module names with a comma (,)
                </span>
              </div>
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