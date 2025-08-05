"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function MessageNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();
      
      // Poll for new messages every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch("/api/conversations", {
        headers: {
          "x-user-id": user.id,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Sum up all unread counts from conversations
        const totalUnread = data.conversations?.reduce((total: number, conv: any) => {
          return total + (conv.unreadCount || 0);
        }, 0) || 0;
        
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error("Error fetching unread messages count:", error);
    }
  };

  if (!user || unreadCount === 0) {
    return null;
  }

  return (
    <Link 
      href="/messages"
      className="relative inline-flex items-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      <ChatBubbleLeftRightIcon className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-blue-500 rounded-full">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
} 