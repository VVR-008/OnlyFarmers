'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PaperAirplaneIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  CpuChipIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

type Message = { 
  role: "user" | "ai"; 
  content: string; 
  timestamp?: Date;
};

export default function ChatPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "ai", 
      content: "Hello! I'm your Farm AI assistant powered by Gemini. I'm here to help you with farming questions, crop advice, livestock guidance, and anything related to agriculture. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus input on mount
  useEffect(() => {
    if (user) {
      inputRef.current?.focus();
    }
  }, [user]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!userInput.trim() || loading || !user) return;

    const newUserMessage: Message = {
      role: "user",
      content: userInput.trim(),
      timestamp: new Date()
    };

    const nextMessages = [...messages, newUserMessage];
    setMessages(nextMessages);
    setUserInput("");
    setLoading(true);
    setError(null);

    try {
      // Transform messages for API
      const chatPayload = nextMessages.map(m => ({
        role: m.role === "ai" ? "assistant" : "user", // Changed to match API expectation
        content: m.content
      }));

      const res = await fetch("/api/chat", { // Updated to use the new authenticated endpoint
        method: 'POST',
        headers: { 
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }) // Include auth token
        },
        body: JSON.stringify({ messages: chatPayload }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Session expired. Please log in again.");
          setTimeout(() => router.push("/login"), 2000);
          return;
        }
        
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const aiResponse: Message = {
        role: "ai",
        content: data.text || "Sorry, I couldn't generate a response.",
        timestamp: new Date()
      };

      setMessages([...nextMessages, aiResponse]);
      
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.message || "Failed to send message. Please try again.");
      
      const errorMessage: Message = {
        role: "ai",
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages([...nextMessages, errorMessage]);
    } finally {
      setLoading(false);
      // Refocus input after sending
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  // Loading state for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-white rounded-full shadow-lg">
            <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-green-700 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
            <div className="p-2 bg-white bg-opacity-20 rounded-xl">
              <SparklesIcon className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Farm AI Assistant</h1>
              <p className="text-gray-600">Powered by Gemini Pro • Ask anything about agriculture</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-white/20 overflow-hidden">
          {/* Chat Messages */}
          <div className="h-[60vh] overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "ai" && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <CpuChipIcon className="h-5 w-5 text-white" />
                  </div>
                )}
                
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  msg.role === "user" 
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white ml-auto" 
                    : "bg-gray-100 text-gray-900"
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  {msg.timestamp && (
                    <p className={`text-xs mt-2 ${
                      msg.role === "user" ? "text-green-100" : "text-gray-500"
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CpuChipIcon className="h-5 w-5 text-white" />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-gray-600 text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t border-gray-200 p-6 bg-white/50">
            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                ref={inputRef}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="Ask about farming, crops, livestock, weather, soil management..."
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                aria-label="Type your farming question"
                maxLength={500}
              />
              <button 
                type="submit" 
                disabled={loading || !userInput.trim()}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <PaperAirplaneIcon className="h-5 w-5" />
                )}
                {loading ? "Sending..." : "Send"}
              </button>
            </form>

            {/* Character count */}
            <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>Logged in as <strong>{user.name}</strong></span>
                <span className="inline-flex items-center gap-1">
                  <SparklesIcon className="h-3 w-3" />
                  Powered by Gemini Pro
                </span>
              </div>
              <span className={userInput.length > 450 ? 'text-red-500' : ''}>
                {userInput.length}/500
              </span>
            </div>

            {/* Disclaimer */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-xs text-yellow-800">
                <strong>Disclaimer:</strong> This AI assistant provides general agricultural guidance. 
                Always consult with local agricultural experts and extension services for specific farming decisions. 
                Do not share sensitive personal or financial information.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            "What's the best time to plant wheat in North India?",
            "How do I prevent pest attacks on my tomato crops?",
            "What are the signs of nutrient deficiency in rice plants?"
          ].map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => setUserInput(suggestion)}
              className="p-4 text-left bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 hover:bg-white hover:shadow-lg transition-all duration-200 text-sm text-gray-700 hover:text-green-700"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
