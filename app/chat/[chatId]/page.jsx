"use client";
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import useAuth from '../../../hooks/useAuth';
import { Card, CardBody, CardHeader, Input, Button, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";

const ChatMessage = ({ message, isCurrentUser, senderName, messageTime }) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isCurrentUser ? 'bg-primary-100 text-primary-800' : 'bg-default-100 text-default-800'} rounded-lg p-3`}>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold">{senderName}</span>
          <time className="text-xs text-default-400">{messageTime}</time>
        </div>
        <p>{message.text}</p>
      </div>
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
    if (!user || !chatId || authLoading) return;
    const chatDocRef = doc(db, 'chats', chatId);
    const unsubscribeChat = onSnapshot(chatDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().participantIds.includes(user.uid)) {
        setChatInfo(docSnap.data());
      } else {
        router.push('/chat');
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
      unsubscribeChat();
      unsubscribeMessages();
    };
  }, [user?.uid, chatId, authLoading]);

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
  
  const getParticipantInfo = (senderId) => {
    if (!chatInfo || !senderId) return { name: "Unknown" };
    return chatInfo.participantInfo?.[senderId] ?? { name: "Unknown" };
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }
  const otherParticipant = getParticipantInfo(chatInfo?.participantIds.find(id => id !== user.uid));
  return (
    <Card className="h-[calc(100vh-80px)] max-w-4xl mx-auto shadow-lg">
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">{otherParticipant.name}</h2>
        </div>
      </CardHeader>
      <CardBody className="flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => {
            const sender = getParticipantInfo(msg.senderId);
            const messageTime = msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "";
            
            return (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                isCurrentUser={msg.senderId === user.uid}
                senderName={sender.name}
                messageTime={messageTime}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="p-4 border-t border-default-200 flex gap-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            autoComplete="off"
            endContent={
              <Button
                isIconOnly
                color="primary"
                type="submit"
                disabled={!newMessage.trim()}
              >
                <Icon icon="lucide:send" width={20} height={20} />
              </Button>
            }
          />
        </form>
      </CardBody>
    </Card>
  );
}