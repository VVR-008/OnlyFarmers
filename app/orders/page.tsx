"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CurrencyRupeeIcon,
  PlusIcon 
} from "@heroicons/react/24/outline";

interface Order {
  _id: string;
  buyer: { _id: string; name: string; email: string; phone: string };
  seller: { _id: string; name: string; email: string; phone: string };
  listing: any;
  listingType: "crop" | "livestock" | "land";
  quantity?: number;
  totalPrice: number;
  message: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  createdAt: string;
  buyerContact: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (user?.id && user.role === "buyer") {
      fetchMyOrders();
    }
  }, [user, filter]);

  const fetchMyOrders = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const statusParam = filter !== "all" ? `&status=${filter}` : "";
      const response = await fetch(`/api/orders?user=${user.id}&role=buyer&limit=50${statusParam}`);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case "accepted": return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "rejected": return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case "completed": return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      default: return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-4">Please login to view your orders</p>
            <Link href="/login" className="text-green-700 underline">Login</Link>
          </div>
        </div>
      </>
    );
  }

  if (user.role !== "buyer") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-4">This page is for buyers only. Farmers should use the order requests page.</p>
            <Link href="/order-requests" className="text-green-700 underline">
              Go to Order Requests (Farmers)
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Order Requests</h1>
              <p className="text-gray-600">Track your purchase requests and order status</p>
            </div>
            <Link
              href="/listings"
              className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Browse Listings
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
            {["all", "pending", "accepted", "rejected", "completed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  filter === status
                    ? "bg-white text-green-700 shadow"
                    : "text-gray-600 hover:text-gray-700"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === "all" && ` (${orders.length})`}
                {status !== "all" && ` (${orders.filter(o => o.status === status).length})`}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No order requests yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start browsing listings to place your first order request
              </p>
              <Link
                href="/listings"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse Listings
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">
                          {order.listing?.title || order.listing?.cropName || "Listing"}
                        </h3>
                        <p className="text-gray-600 text-sm capitalize">
                          {order.listingType} • Seller: {order.seller.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      {order.quantity && (
                        <div>
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <p className="font-medium">{order.quantity}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-gray-600">Amount:</span>
                        <div className="flex items-center gap-1">
                          <CurrencyRupeeIcon className="h-4 w-4 text-green-600" />
                          <span className="font-bold text-green-700">
                            ₹{order.totalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Request Date:</span>
                        <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Seller Contact:</span>
                        <p className="font-medium text-sm">{order.seller.phone}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-sm text-gray-600">Your Message:</span>
                      <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{order.message}</p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Request ID: #{order._id.slice(-8)}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/orders/${order._id}`}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          View Details
                        </Link>
                        {order.status === "accepted" && (
                          <div className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md">
                            ✅ Contact seller to complete purchase
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
