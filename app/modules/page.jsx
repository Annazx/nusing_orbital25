"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import TutorCard from "@/components/TutorCard"; // Use your alias or correct path

export default function TutorsPage() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      try {
        const usersCollectionRef = collection(db, "users");
        const q = query(
          usersCollectionRef, 
          where("role", "==", "tutor"),
          where("profileComplete", "==", true)
        );
        
        const querySnapshot = await getDocs(q);
        
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

  const filteredTutors = searchTerm.trim() === ''
    ? tutors
    : tutors.filter(tutor =>
        tutor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.modules?.some(mod =>
          mod.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-4xl font-bold mb-6">Find Your Tutor</h1>
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by tutor name or module"
          className="input input-bordered w-full max-w-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-10">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutors.length > 0 ? (
            filteredTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No tutors found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}