"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { BellIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function OrderNotifications() {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.id && user.role === "farmer") {
      fetchPendingCount();
      
      // Poll for new orders every 30 seconds
      const interval = setInterval(fetchPendingCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchPendingCount = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/orders?user=${user.id}&role=seller&status=pending&limit=1`);
      const data = await response.json();
      setPendingCount(data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching pending orders count:", error);
    }
  };

  if (!user || user.role !== "farmer" || pendingCount === 0) {
    return null;
  }

  return (
    <Link 
      href="/order-requests"
      className="relative inline-flex items-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      <BellIcon className="h-6 w-6" />
      {pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full">
          {pendingCount > 9 ? "9+" : pendingCount}
        </span>
      )}
    </Link>
  );
}
