"use client";

import { useState, useEffect } from "react";
import React from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import TutorCard from "@/components/TutorCard";
import { Input, Card, CardBody, Spinner, Button} from "@heroui/react";

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
    <div className="container mx-auto px-6 py-10 max-w-6xl">
      <h1 className="text-4xl font-bold mb-6 text-center">Find Your Tutor</h1>
      <Card className="mb-8 shadow-sm">
        <CardBody className = "flex justify-center p-4"> 
         <Input
         isClearable
         type="text"
         placeholder="Search by tutor name or module"
         className="max-w"
         value={searchTerm}
         onChange={(e) => setSearchTerm(e.target.value)} 
          />
          </CardBody>
        </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" color="primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {filteredTutors.length > 0 ? (
            filteredTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-16">
              <p className="text-xl font-semibold mb-2">No tutors found.</p>
              <p className="mb-4"> Try adjusting your search criteria.</p>
              <Button
                color="primary"
                variant="flat"
                onPress={() => setSearchTerm("")}
              >
                Reset Search
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}