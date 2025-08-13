"use client";
import React from 'react';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import useAuth from '../../hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Spinner, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export default function ChatListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait until the authentication state is determined.
    if (authLoading) {
      return;
    }

    // If there is no user, redirect to login.
    if (!user) {
      router.push('/login');
      return;
    }

    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef, 
      where('participantIds', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chatsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching chats: ", error);
      setLoading(false);
    });

    return () => unsubscribe();

  }, [user?.uid, authLoading, router]);

  // Display a loading spinner while waiting for auth or data.
  if (authLoading || loading) {
    return (
        <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

   if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  // Helper function to get the other user's info from the chat document
  const getOtherParticipant = (chat) => {
    if (!user) return null;
    const otherId = chat.participantIds.find(id => id !== user.uid);
    return chat.participantInfo[otherId];
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Your Conversations</h1>
      <div className="space-y-4">
        {chats.length > 0 ? (
          chats.map(chat => {
            const otherUser = getOtherParticipant(chat);
            if (!otherUser) return null; // Don't render if other user info is missing

            return (
              <Link key={chat.id} href={`/chat/${chat.id}`} className="block">
                <Card isPressable className="shadow-sm hover:bg-neutral-focus transition-colors">
                  <CardBody className="flex items-center gap-4">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg">{otherUser.name || "Tutor"}</h3>
                      <p className="text-small text-default-500 truncate">
                        {chat.lastMessage?.text || "Click to start the conversation."}
                      </p>
                    </div>
                    <Icon icon="lucide:chevron-right" className="text-default-400" width={24} height={24} />
                  </CardBody>
                </Card>
              </Link>
            );
          })
        ) : (
          <p className="text-center text-gray-500 mt-10">You have no active conversations. Find a tutor to start one!</p>
        )}
      </div>
    </div>
  );
}