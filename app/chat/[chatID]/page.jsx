"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import useAuth from '../../../hooks/useAuth';

// A small component for a single chat message
const ChatMessage = ({ message, isCurrentUser }) => {
  const messageClass = isCurrentUser ? 'chat-end' : 'chat-start';
  const bubbleClass = isCurrentUser ? 'chat-bubble-primary' : 'chat-bubble';
  return (
    <div className={`chat ${messageClass}`}>
      <div className={`chat-bubble ${bubbleClass}`}>{message.text}</div>
    </div>
  );
};

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams(); // To get { chatId: '...' } from URL
  const router = useRouter();
  const chatId = params.chatId;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatInfo, setChatInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!user || !chatId) return;

    // Fetch chat metadata
    const chatDocRef = doc(db, 'chats', chatId);
    getDoc(chatDocRef).then(docSnap => {
        if(docSnap.exists() && docSnap.data().participantIds.includes(user.uid)) {
            setChatInfo(docSnap.data());
        } else {
            // Invalid chat or user not a member, redirect
            console.error("Access denied or chat does not exist.");
            router.push('/chat');
        }
    });

    // Set up a real-time listener for messages
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, chatId, router]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const chatRef = doc(db, 'chats', chatId);

    try {
      // Add the new message to the 'messages' subcollection
      await addDoc(messagesRef, {
        text: newMessage,
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });

      // Update the parent 'chat' document with the last message info
      await updateDoc(chatRef, {
        lastMessage: {
            text: newMessage,
            senderId: user.uid,
        },
        updatedAt: serverTimestamp(),
      });

      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  const getOtherParticipantName = () => {
    if (!chatInfo || !user) return "Tutor";
    const otherId = chatInfo.participantIds.find(id => id !== user.uid);
    return chatInfo.participantInfo[otherId]?.name || "Tutor";
  }

  if (authLoading || loading) {
    return <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">{getOtherParticipantName()}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} isCurrentUser={msg.senderId === user.uid} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="input input-bordered flex-1"
        />
        <button type="submit" className="btn btn-primary">Send</button>
      </form>
    </div>
  );
}