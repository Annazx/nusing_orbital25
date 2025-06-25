// app/tutors/page.jsx (REVISED)
"use client";
import { useState, useEffect } from "react";
// We only need collection and getDocs from firestore now for the base query
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../config/firebase";
import TutorCard from "@/components/TutorCard";

export default function TutorsPage() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      try {
        // REVISED QUERY: Simply fetch all documents from the 'tutors' collection.
        // The existence of a document here implies it's a complete tutor profile.
        const tutorsCollectionRef = collection(db, "tutors");
        const querySnapshot = await getDocs(tutorsCollectionRef);
        const tutorsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
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

  // Filtering logic now checks the 'classes' array
  const filteredTutors = tutors.filter(
    (tutor) =>
      tutor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.classes?.some((cls) =>
        cls.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Find Your Tutor</h1>
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by tutor name or class (e.g., Calculus)"
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
