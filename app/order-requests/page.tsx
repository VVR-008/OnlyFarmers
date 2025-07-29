"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { 
  BellIcon,
  CheckCircleIcon, 
  XCircleIcon,
  CurrencyRupeeIcon,
  EyeIcon,
  UserIcon 
} from "@heroicons/react/24/outline";

interface OrderRequest {
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

export default function OrderRequestsPage() {
  const { user } = useAuth();
  const [orderRequests, setOrderRequests] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && user.role === "farmer") {
      fetchOrderRequests();
    }
  }, [user, filter]);

  const fetchOrderRequests = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const statusParam = filter !== "all" ? `&status=${filter}` : "";
      const response = await fetch(`/api/orders?user=${user.id}&role=seller&limit=50${statusParam}`);
      const data = await response.json();
      setOrderRequests(data.orders || []);
    } catch (error) {
      console.error("Error fetching order requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: "accepted" | "rejected") => {
    setUpdating(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrderRequests(); // Refresh the list
        alert(`Order ${newStatus} successfully!`);
      } else {
        alert("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status");
    } finally {
      setUpdating(null);
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

  const pendingCount = orderRequests.filter(o => o.status === "pending").length;

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-4">Please login to view order requests</p>
            <Link href="/login" className="text-green-700 underline">Login</Link>
          </div>
        </div>
      </>
    );
  }

  if (user.role !== "farmer") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-4">This page is for farmers only. Buyers should use the orders page.</p>
            <Link href="/orders" className="text-green-700 underline">
              Go to My Orders (Buyers)
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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Order Requests</h1>
                {pendingCount > 0 && (
                  <div className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    <BellIcon className="h-4 w-4" />
                    {pendingCount} New
                  </div>
                )}
              </div>
              <p className="text-gray-600">Manage purchase requests from buyers</p>
            </div>
            <Link
              href="/my-listings"
              className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              View My Listings
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
            {["pending", "accepted", "rejected", "all"].map((status) => (
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
                {status === "pending" && pendingCount > 0 && ` (${pendingCount})`}
                {status === "all" && ` (${orderRequests.length})`}
                {status !== "pending" && status !== "all" && ` (${orderRequests.filter(o => o.status === status).length})`}
              </button>
            ))}
          </div>

          {/* Order Requests List */}
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
          ) : orderRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No order requests yet
              </h3>
              <p className="text-gray-500 mb-6">
                Order requests from buyers will appear here
              </p>
              <Link
                href="/my-listings"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Check My Listings
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orderRequests.map((request) => (
                <div 
                  key={request._id} 
                  className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow ${
                    request.status === "pending" ? "border-l-4 border-yellow-400" : ""
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">
                            {request.listing?.title || request.listing?.cropName || "Listing"}
                          </h3>
                          {request.status === "pending" && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm capitalize">
                          {request.listingType} • Buyer: {request.buyer.name}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      {request.quantity && (
                        <div>
                          <span className="text-sm text-gray-600">Requested Quantity:</span>
                          <p className="font-medium">{request.quantity}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-gray-600">Offer Amount:</span>
                        <div className="flex items-center gap-1">
                          <CurrencyRupeeIcon className="h-4 w-4 text-green-600" />
                          <span className="font-bold text-green-700">
                            ₹{request.totalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Request Date:</span>
                        <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Buyer Contact:</span>
                        <p className="font-medium text-sm">{request.buyerContact.phone}</p>
                      </div>
                    </div>

                    {/* Buyer Contact Details */}
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <UserIcon className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Buyer Details</span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-2 text-sm">
                        <div><strong>Name:</strong> {request.buyerContact.name}</div>
                        <div><strong>Email:</strong> {request.buyerContact.email}</div>
                        <div><strong>Phone:</strong> {request.buyerContact.phone}</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-sm text-gray-600">Buyer's Message:</span>
                      <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{request.message}</p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Request ID: #{request._id.slice(-8)}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/orders/${request._id}`}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View Details
                        </Link>
                        
                        {request.status === "pending" && (
                          <div className="flex gap-1">
                            <button 
                              onClick={() => updateOrderStatus(request._id, "accepted")}
                              disabled={updating === request._id}
                              className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                              {updating === request._id ? "Accepting..." : "Accept"}
                            </button>
                            <button 
                              onClick={() => updateOrderStatus(request._id, "rejected")}
                              disabled={updating === request._id}
                              className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              <XCircleIcon className="h-4 w-4" />
                              {updating === request._id ? "Rejecting..." : "Reject"}
                            </button>
                          </div>
                        )}
                        
                        {request.status === "accepted" && (
                          <div className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md">
                            ✅ Accepted - Contact buyer to complete sale
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
