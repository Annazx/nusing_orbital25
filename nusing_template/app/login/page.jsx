'use client';
// app/tutors/page.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import TutorCard from '@/components/TutorCard';

export default function TutorsPage() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      try {
        // Query the 'users' collection for users with the role 'tutor'
        const q = query(collection(db, 'users'), where('role', '==', 'tutor'), where('profileComplete', '==', true));
        const querySnapshot = await getDocs(q);
        const tutorsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTutors(tutorsData);
      } catch (error) {
        console.error("Error fetching tutors: ", error);
      }
      setLoading(false);
    };

    fetchTutors();
  }, []);

  const filteredTutors = tutors.filter(tutor => 
    tutor.modules?.some(module => module.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Find Your Tutor</h1>
      <div className="mb-8">
        <input 
          type="text" 
          placeholder="Search by module code (e.g., CS2040S)" 
          className="input input-bordered w-full max-w-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center"><span className="loading loading-spinner loading-lg"></span></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutors.length > 0 ? (
            filteredTutors.map(tutor => <TutorCard key={tutor.id} tutor={tutor} />)
          ) : (
            <p>No tutors found matching your criteria.</p>
          )}
        </div>
      )}
    </div>
  );
}