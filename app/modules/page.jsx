// app/tutors/page.jsx (REVISED)
"use client";
import { useState, useEffect } from "react";
// We only need collection and getDocs from firestore now for the base query
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import TutorCard from "@/components/TutorCard";

export default function ModulesPage() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      try {
        // --- CRITICAL FIX ---
        // 1. Query the 'users' collection.
        // 2. Add a 'where' clause to only get users with role 'tutor' and a complete profile.
        const usersCollectionRef = collection(db, "users");
        const q = query(
          usersCollectionRef, 
          where("role", "==", "tutor"),
          where("profileComplete", "==", true)
        );
        
        const querySnapshot = await getDocs(q);
        const tutorsData = querySnapshot.docs.map((doc) => ({
          id: doc.id, // The ID will now be the User ID
          ...doc.data(),
        }));
        setTutors(tutorsData);
      } catch (error) {
        console.error("Error fetching tutors: ", error);
      }
      setLoading(false);
    };

    fetchTutors();
  }, []);

  // Filtering logic now checks the 'modules' array
  const filteredTutors = tutors.filter(
    (tutor) =>
      tutor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.modules?.some((mod) =>
        mod.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Find Your Tutor</h1>
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by tutor name or module (e.g., CS2040S)"
          className="input input-bordered w-full max-w-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutors.length > 0 ? (
            filteredTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))
          ) : (
            <p>No tutors found matching your criteria.</p>
          )}
        </div>
      )}
    </div>
  );
}
