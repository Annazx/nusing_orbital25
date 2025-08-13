"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase"; 
import useAuth from "../hooks/useAuth";
import { Button } from "@heroui/react"; 
import { Icon } from "@iconify/react";
import toast from 'react-hot-toast'; 


export default function ChatButton({ tutorId, tutorName }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isCreating, setIsCreating] = React.useState(false);

  const handleStartChat = async () => {
    setIsCreating(true);
    const chatId = [user.uid, tutorId].sort().join('_');
    const chatRef = doc(db, "chats", chatId);

    try {
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        // 1. Get a reference to the current user's document in the 'users' collection.
        const userDocRef = doc(db, "users", user.uid);
        
        // 2. Fetch the document.
        const userDocSnap = await getDoc(userDocRef);
        
        // 3. Extract the name, with a safe fallback.
        let currentUserName = "Student"; // Default name
        if (userDocSnap.exists()) {
          currentUserName = userDocSnap.data().name || "Student";
        }
        
        // 4. Use the fetched name when creating the chat document.
        await setDoc(chatRef, {
          participantIds: [user.uid, tutorId],
          participantInfo: {
            [user.uid]: { name: currentUserName }, // Use the fetched name
            [tutorId]: { name: tutorName },
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastMessage: null,
        });
      }
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  if (loading || !user || user.uid === tutorId) {
    return null;
  }

  return (
    <Button
      color="primary"
      endContent={<Icon icon="lucide:message-circle"/>}
      as="a" 
      onClick={handleStartChat}>
      Chat
    </Button>
  );
}