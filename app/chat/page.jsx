"use client";
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import useAuth from '../../hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ChatListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Wait until auth state is determined
    if (!user) {
        // If no user, redirect to login page after a short delay
        setTimeout(() => router.push('/login'), 1000);
        return;
    }

    setLoading(true);
    // Query to get all chats where the current user is a participant
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef, 
      where('participantIds', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chatsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatsData);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();

  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;
  }
  
  if (!user) {
      return <div className="text-center p-10">Redirecting to login...</div>
  }

  // Function to get the other participant's info
  const getOtherParticipant = (chat) => {
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
            return (
              <Link key={chat.id} href={`/chat/${chat.id}`} className="block">
                <div className="p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
                  <h3 className="font-bold text-lg">{otherUser?.name || "Tutor"}</h3>
                  <p className="text-gray-500 truncate">
                    {chat.lastMessage?.text || "No messages yet"}
                  </p>
                </div>
              </Link>
            )
          })
        ) : (
          <p>You have no active conversations. Start one from a tutor's profile!</p>
        )}
      </div>
    </div>
  );
}