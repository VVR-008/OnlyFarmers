"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  PaperAirplaneIcon,
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Base64Image from "@/components/ui/base64-image";
import UserSearch from "@/components/ui/user-search";

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  messageType: 'text' | 'image' | 'file';
  read: boolean;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
  }>;
  listingId?: {
    _id: string;
    title: string;
    images?: string[];
  };
  listingType?: 'crop' | 'livestock' | 'land';
  lastMessage?: {
    content: string;
    sender: string;
    createdAt: string;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "farmer" | "buyer";
  phone?: string;
  isVerified: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  console.log("Messages page - User:", user, "Auth loading:", authLoading);

  useEffect(() => {
    if (user && !authLoading) {
      fetchConversations();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      console.log("Fetching conversations for user:", user?.id);
      const response = await fetch("/api/conversations", {
        headers: {
          "x-user-id": user?.id || "",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "Failed to fetch conversations");
      }

      const data = await response.json();
      console.log("Conversations data:", data);
      setConversations(data.conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        headers: {
          "x-user-id": user?.id || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages");
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/conversations/${selectedConversation._id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          messageType: 'text'
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      setMessages(prev => [...prev, data.message]);
      setNewMessage("");
      
      // Update conversation list with new last message
      setConversations(prev => 
        prev.map(conv => 
          conv._id === selectedConversation._id 
            ? { ...conv, lastMessage: data.message }
            : conv
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p._id !== user?.id);
  };

  const handleUserSelect = (selectedUser: User) => {
    // Create a new conversation with the selected user
    fetch("/api/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user?.id || "",
      },
      body: JSON.stringify({
        otherUserId: selectedUser.id,
        initialMessage: `Hi ${selectedUser.name}! I'd like to start a conversation with you.`
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.conversationId) {
        // Refresh conversations list
        fetchConversations();
        setShowNewConversation(false);
      }
    })
    .catch(error => {
      console.error("Error creating conversation:", error);
      setError("Failed to start conversation. Please try again.");
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-b-2 border-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Not Logged In</h2>
          <p className="text-gray-600 mb-4">Please log in to access messages</p>
          <button 
            onClick={() => router.push("/login")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-green-700 hover:bg-green-100 rounded-xl transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600">Chat with buyers and sellers</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
            {/* Conversations List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                <button
                  onClick={() => setShowNewConversation(!showNewConversation)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  New Chat
                </button>
              </div>
              
              {/* New Conversation Search */}
              {showNewConversation && (
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Start a new conversation</h3>
                  <UserSearch
                    onUserSelect={handleUserSelect}
                    placeholder="Search for users to chat with..."
                    className="w-full"
                    excludeUserId={user?.id}
                  />
                </div>
              )}
              
              {loading ? (
                <div className="p-4">
                  <div className="h-8 w-8 border-b-2 border-green-600 rounded-full animate-spin mx-auto" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No conversations yet</p>
                  <p className="text-sm text-gray-400">Start chatting by viewing a listing</p>
                </div>
              ) : (
                <div className="overflow-y-auto h-full">
                  {conversations.map((conversation) => {
                    const otherUser = getOtherParticipant(conversation);
                    const isSelected = selectedConversation?._id === conversation._id;
                    
                    return (
                      <div
                        key={conversation._id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-green-50 border-green-200' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <UserCircleIcon className="h-6 w-6 text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900 truncate">
                                {otherUser?.name || 'Unknown User'}
                              </h3>
                              {conversation.unreadCount > 0 && (
                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.lastMessage?.content || 'No messages yet'}
                            </p>
                            {conversation.listingId && (
                              <p className="text-xs text-green-600 truncate">
                                Re: {conversation.listingId.title}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <UserCircleIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {getOtherParticipant(selectedConversation)?.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {getOtherParticipant(selectedConversation)?.role || 'User'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="h-[calc(70vh-200px)] overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isOwnMessage = message.sender._id === user?.id;
                      
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            isOwnMessage
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isOwnMessage ? 'text-green-100' : 'text-gray-500'
                            }`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <form onSubmit={sendMessage} className="flex gap-3">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {sending ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <PaperAirplaneIcon className="h-4 w-4" />
                        )}
                        Send
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-500">Choose a conversation from the list to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 