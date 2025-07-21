"use client"; // Add this line to use hooks

import Link from "next/link";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import useAuth from "../hooks/useAuth"; // Import our new hook

const TutorCard = ({ tutor }) => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // The function that handles starting a chat
  const handleStartChat = async () => {
    if (!user) {
      alert("Please log in to start a chat.");
      router.push("/login"); // Redirect to your login page
      return;
    }

    if (user.uid === tutor.id) {
        alert("You cannot start a chat with yourself.");
        return;
    }

    // Create a unique chat ID from the two user IDs, sorted to be consistent
    const chatId = [user.uid, tutor.id].sort().join('_');
    const chatRef = doc(db, "chats", chatId);

    try {
      const chatSnap = await getDoc(chatRef);
      
      // If the chat doesn't exist, create it
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participantIds: [user.uid, tutor.id],
          // Store participant info to avoid extra db reads later
          participantInfo: {
            [user.uid]: {
                name: user.displayName || "Student", // Or fetch from your users collection
                // avatarUrl: user.photoURL || ""
            },
            [tutor.id]: {
                name: tutor.name,
                // avatarUrl: tutor.avatarUrl || ""
            }
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastMessage: null,
        });
      }
      
      // Navigate to the chat page
      router.push(`/chat/${chatId}`);

    } catch (error) {
      console.error("Error creating or navigating to chat:", error);
      alert("Could not start chat. Please try again.");
    }
  };

  const averageRating =
    tutor.numRatings > 0
      ? (tutor.rating / tutor.numRatings).toFixed(1)
      : "No ratings";

  return (
    <div className="card bg-base-100 shadow-xl transition-transform hover:scale-105">
      <div className="card-body">
        <h2 className="card-title">{tutor.name}</h2>
        <p className="text-gray-600 h-20 overflow-hidden text-ellipsis">
          {tutor.bio}
        </p>

        {/* ... (rest of your card content like modules, rating) ... */}
        
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
    </div>
  );
};

export default TutorCard;