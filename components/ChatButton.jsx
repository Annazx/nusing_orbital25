"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase"; 
import useAuth from "../hooks/useAuth";
import { Button } from "@heroui/react"; 

export default function ChatButton({ tutorId, tutorName }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleStartChat = async () => {
    const chatId = [user.uid, tutorId].sort().join('_');
    const chatRef = doc(db, "chats", chatId);

    try {
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participantIds: [user.uid, tutorId],
          participantInfo: {
            [user.uid]: { name: user.displayName || "Student" },
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

  // Don't render the button if auth is loading, user isn't logged in,
  // or the user is looking at their own profile.
  if (loading || !user || user.uid === tutorId) {
    return null;
  }

  return (
    <Button className="btn btn-primary" onClick={handleStartChat}>
      Chat
    </Button>
  );
}