"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import useAuth from "../hooks/useAuth";

const TutorCard = ({ tutor }) => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const handleStartChat = async () => {
    // --- START DEBUGGING ---
    console.log("--- handleStartChat INITIATED ---");

    if (!user) {
      console.log("DEBUG: User not logged in. Aborting.");
      alert("Please log in to start a chat.");
      router.push("/login");
      return;
    }

    console.log(`DEBUG: Current User UID: ${user.uid}`);
    console.log(`DEBUG: Tutor ID: ${tutor.id}`);

    if (user.uid === tutor.id) {
        alert("You cannot start a chat with yourself.");
        return;
    }

    const chatId = [user.uid, tutor.id].sort().join('_');
    console.log(`DEBUG: Generated Chat ID: ${chatId}`);
    // --- END DEBUGGING ---

    const chatRef = doc(db, "chats", chatId);

    try {
      const chatSnap = await getDoc(chatRef);
      
      if (!chatSnap.exists()) {
        console.log("DEBUG: Chat does not exist. Creating new chat document...");
        await setDoc(chatRef, {
          participantIds: [user.uid, tutor.id],
          participantInfo: {
            [user.uid]: { name: user.displayName || "Student" },
            [tutor.id]: { name: tutor.name },
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastMessage: null,
        });
        console.log("DEBUG: New chat document created successfully.");
      } else {
        console.log("DEBUG: Chat already exists. Proceeding to navigation.");
      }
      
      console.log(`DEBUG: Navigating to /chat/${chatId}`);
      router.push(`/chat/${chatId}`);

    } catch (error) {
      console.error("DEBUG: Error in handleStartChat:", error);
      alert("Could not start chat. Please try again.");
    }
  };

  // ... rest of your component (no changes needed here)
  return (
    <div className="card bg-base-100 shadow-xl transition-transform hover:scale-105">
      {/* ... card body ... */}
      <div className="card-actions justify-end">
          <Link href={`/tutors/${tutor.id}`} className="btn btn-outline">
            View Profile
          </Link>
          <button 
            className="btn btn-primary" 
            onClick={handleStartChat}
            disabled={authLoading}
          >
            Chat
          </button>
        </div>
    </div>
  );
};

export default TutorCard;