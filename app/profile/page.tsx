"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

import { Form, Input, Textarea, Button } from "@heroui/react";

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

  const handleValueChange = (name: keyof TutorProfileData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      modules: formData.modules.split(",").map((m) => m.trim()).filter(Boolean), 
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
      router.push(`/modules`); 
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
    return <div className="flex justify-center items-center py-5"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body text-center p-8">
          <h1 className="card-title text-3xl font-bold justify-center">Your Tutor Profile</h1>
          <p className = "text-base-content/70 mb-4">This information will be visible to students seeking help.</p>

          <Form onSubmit={handleSubmit} className="flex gap-10 justify-center items-center">
            {/* NAME FIELD */}
            <Input
              isRequired
              label="Full Name"
              labelPlacement = "outside-top"
              name="name"
              placeholder="e.g., Alex Tan"
              radius={"sm"}
              value={formData.name}
              onValueChange={handleValueChange("name")}
            />

            {/* BIO FIELD */}
            <Textarea
              isRequired
              label="Bio"
              labelPlacement = "outside-top"
              name="bio"
              placeholder="Tell students about your teaching style, your academic achievements, and why you're a great tutor."
              radius={"sm"}
              value={formData.bio}
              onValueChange={handleValueChange("bio")}
            />

            {/* PREFERRED RATE FIELD */}
            <Input
              isRequired
              label="Preferred Rate ($/hr)"
              labelPlacement = "outside-top"
              name="preferredRate"
              placeholder="e.g., 25"
              radius={"sm"}
              type="number"
              min="0"
              value={formData.preferredRate}
              onValueChange={handleValueChange("preferredRate")}
            />

            {/* MODULES FIELD */}
             <Input
              isRequired
              label="Modules Taught"
              labelPlacement = "outside-top"
              name="modules"
              placeholder="e.g. CS2040S, MA1521"
              radius={"sm"}
              description="Separate module names with a comma (,)"
              value={formData.modules}
              onValueChange={handleValueChange("modules")}
            />
            
            <Button
              color="primary"
              type="submit"
              isLoading={isSubmitting} // Use the isLoading prop for the loading state
            >
              {isSubmitting ? "Saving..." : "Save Profile"}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}