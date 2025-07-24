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
    // Wait until the authentication state is determined.
    if (authLoading) {
      return;
    }

    // If there is no user, redirect to login.
    if (!user) {
      router.push('/login');
      return;
    }

    // This is the Firestore query to get all chats for the current user,
    // sorted by the most recently updated.
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef, 
      where('participantIds', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    // onSnapshot creates a real-time listener.
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chatsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatsData);
      setLoading(false);
    }, (error) => {
      // It's good practice to handle potential errors.
      console.error("Error fetching chats: ", error);
      setLoading(false);
    });

    // This cleanup function is called when the component unmounts,
    // which prevents memory leaks.
    return () => unsubscribe();

  // We depend on `user.uid` (a primitive string) instead of the `user` object.
  // This prevents an infinite loop because the string 'xyz' will always equal 'xyz',
  // whereas a user object reference can change on every render.
  }, [user?.uid, authLoading, router]);

  // Display a loading spinner while waiting for auth or data.
  if (authLoading || loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <span className="loading loading-spinner loading-lg"></span>
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
                <div className="p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors cursor-pointer">
                  <h3 className="font-bold text-lg">{otherUser.name || "Tutor"}</h3>
                  <p className="text-gray-500 truncate italic">
                    {chat.lastMessage?.text || "Click to start the conversation."}
                  </p>
                </div>
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