"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import useAuth from '../../../hooks/useAuth';

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
  const params = useParams();
  const router = useRouter();
  const chatId = params.chatId;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatInfo, setChatInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (!chatId) return;

    const chatDocRef = doc(db, 'chats', chatId);
    const unsubscribeChatDoc = onSnapshot(chatDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const chatData = docSnap.data();
        if (chatData.participantIds.includes(user.uid)) {
          setChatInfo(chatData);
        } else {
          console.error("Access Denied: User is not a participant.");
          router.push('/chat');
        }
      }
    });

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setLoading(false);
    });

    return () => {
      unsubscribeChatDoc();
      unsubscribeMessages();
    };

  }, [user?.uid, chatId, authLoading, router]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const chatRef = doc(db, 'chats', chatId);

    try {
      await addDoc(messagesRef, { text: newMessage, senderId: user.uid, createdAt: serverTimestamp() });
      await updateDoc(chatRef, {
        lastMessage: { text: newMessage, senderId: user.uid, createdAt: serverTimestamp() },
        updatedAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  const getOtherParticipantName = () => {
    if (!chatInfo || !user) return "Loading Chat...";
    const otherId = chatInfo.participantIds.find(id => id !== user.uid);
    return chatInfo.participantInfo[otherId]?.name || "Tutor";
  };

  if (loading || authLoading || !chatInfo) {
    return (
        <div className="flex justify-center items-center h-screen">
            <span className="loading loading-spinner loading-lg"></span>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto bg-base-100 shadow-lg rounded-lg">
      <div className="p-4 border-b-2 border-base-300">
        <h2 className="text-xl font-bold text-center">{getOtherParticipantName()}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => <ChatMessage key={msg.id} message={msg} isCurrentUser={msg.senderId === user.uid} />)}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-base-300 flex gap-2">
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="input input-bordered flex-1" autoComplete="off"/>
        <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>Send</button>
      </form>
    </div>
  );
}