"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import {
  TrashIcon,
  PencilIcon,
  EyeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { CurrencyRupeeIcon } from "@heroicons/react/24/solid";

interface MyListing {
  _id: string;
  title: string;
  images?: string[];
  status: string;
  createdAt: string;
  // Crop specific
  cropName?: string;
  price?: number;
  quantity?: { value: number; unit: string };
  category?: string;
  // Livestock specific
  animalType?: string;
  breed?: string;
  purpose?: string;
  // Land specific
  area?: { value: number; unit: string };
  landType?: string;
}

interface ListingCounts {
  crops: number;
  livestocks: number;
  lands: number;
  total: number;
}

export default function MyListingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"crops" | "livestocks" | "lands">("crops");
  const [listings, setListings] = useState<MyListing[]>([]);
  const [counts, setCounts] = useState<ListingCounts>({
    crops: 0,
    livestocks: 0,
    lands: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log("🔍 Auth Debug Info:");
    console.log("User:", user);
    console.log("User ID:", user?.id);
    console.log("User role:", user?.role);
  }, [user]);

  useEffect(() => {
    if (user?.id && user.role === "farmer") {
      fetchMyListings();
      fetchListingCounts();
    } else if (user && user.role !== "farmer") {
      setError("Only farmers can access their listings.");
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user, activeTab]);

  const fetchMyListings = async () => {
    if (!user?.id) {
      console.error("No user ID available");
      setError("No user ID available");
      setLoading(false);
      return;
    }

    console.log("🔍 Fetching listings:");
    console.log("Active Tab:", activeTab);
    console.log("URL:", `/api/my-listings/${activeTab}?farmer=${user.id}`);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/my-listings/${activeTab}?farmer._id=${user.id}`);
      
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Response data:", data);
      
      if (data.error) {
        setError(`API Error: ${data.error}`);
        console.error("API Error:", data.error);
        return;
      }
      
      console.log(`✅ Found ${data.listings?.length || 0} ${activeTab} listings`);
      setListings(data.listings || []);
    } catch (error: any) {
      console.error("Error fetching my listings:", error);
      setError(`Failed to fetch listings: ${error.message}`);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchListingCounts = async () => {
    if (!user?.id) {
      console.error("No user ID available for fetching counts");
      return;
    }

    try {
      console.log("Fetching counts for user:", user.id);
      const response = await fetch(`/api/my-listings/counts?farmer=${user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Counts response:", data);
      
      if (data.error) {
        console.error("Counts API Error:", data.error);
        return;
      }
      
      setCounts(data.counts || { crops: 0, livestocks: 0, lands: 0, total: 0 });
    } catch (error) {
      console.error("Error fetching counts:", error);
      setCounts({ crops: 0, livestocks: 0, lands: 0, total: 0 });
    }
  };

  const handleDelete = async (listingId: string, type: string) => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }

    setDeleting(listingId);
    try {
      const response = await fetch(`/api/listings/${type}?id=${listingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
      });

      if (response.ok) {
        setListings(prev => prev.filter(listing => listing._id !== listingId));
        fetchListingCounts();
        console.log("✅ Listing deleted successfully");
      } else {
        const error = await response.json();
        alert(`Failed to delete listing: ${error.error || error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete listing. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "sold": return "bg-gray-100 text-gray-800";
      case "reserved": return "bg-yellow-100 text-yellow-800";
      case "under_offer": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderCropCard = (listing: MyListing) => (
    <div key={listing._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gray-100 overflow-hidden rounded-t-lg">
        <img
          src={listing.images?.[0] || "/placeholder-crop.jpg"}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-2 capitalize">{listing.cropName} • {listing.category}</p>
        <div className="flex items-center gap-1 mb-3">
          <CurrencyRupeeIcon className="h-4 w-4 text-green-600" />
          <span className="text-green-600 font-bold">
            ₹{listing.price?.toLocaleString()}/{listing.quantity?.unit}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Link
              href={`/listings/crops/${listing._id}`}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="View"
            >
              <EyeIcon className="h-4 w-4" />
            </Link>
            <button
              onClick={() => handleDelete(listing._id, "crops")}
              disabled={deleting === listing._id}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              title="Delete"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(listing.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );

  const renderLivestockCard = (listing: MyListing) => (
    <div key={listing._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gray-100 overflow-hidden rounded-t-lg">
        <img
          src={listing.images?.[0] || "/placeholder-livestock.jpg"}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-2 capitalize">{listing.animalType} • {listing.breed}</p>
        <div className="flex items-center gap-1 mb-3">
          <CurrencyRupeeIcon className="h-4 w-4 text-green-600" />
          <span className="text-green-600 font-bold">₹{listing.price?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Link
              href={`/listings/livestocks/${listing._id}`}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="View"
            >
              <EyeIcon className="h-4 w-4" />
            </Link>
            <button
              onClick={() => handleDelete(listing._id, "livestocks")}
              disabled={deleting === listing._id}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              title="Delete"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(listing.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );

  const renderLandCard = (listing: MyListing) => (
    <div key={listing._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gray-100 overflow-hidden rounded-t-lg">
        <img
          src={listing.images?.[0] || "/placeholder-land.jpg"}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-2 capitalize">
          {listing.area?.value} {listing.area?.unit} • {listing.landType}
        </p>
        <div className="flex items-center gap-1 mb-3">
          <CurrencyRupeeIcon className="h-4 w-4 text-green-600" />
          <span className="text-green-600 font-bold">
            ₹{((listing.price || 0) / 100000).toFixed(1)}L
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Link
              href={`/listings/lands/${listing._id}`}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="View"
            >
              <EyeIcon className="h-4 w-4" />
            </Link>
            <button
              onClick={() => handleDelete(listing._id, "lands")}
              disabled={deleting === listing._id}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              title="Delete"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(listing.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );

  const renderCard = (listing: MyListing) => {
    switch (activeTab) {
      case "crops":
        return renderCropCard(listing);
      case "livestocks":
        return renderLivestockCard(listing);
      case "lands":
        return renderLandCard(listing);
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-10 w-10 border-b-2 border-green-600 rounded-full animate-spin" />
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
            <p className="text-gray-600 mb-4">Only farmers can access their listings.</p>
            <Link href="/login" className="text-green-700 underline">
              Login as Farmer
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
              <p className="text-gray-600">Manage your crops, livestock, and land listings</p>
              {error && (
                <p className="text-red-600 text-sm mt-1">⚠️ {error}</p>
              )}
            </div>
            <Link
              href="/listings/create"
              className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New Listing
            </Link>
          </div>

          {/* Tabs with counts */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("crops")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "crops"
                  ? "bg-white text-green-700 shadow"
                  : "text-gray-600 hover:text-gray-700"
              }`}
            >
              🌾 Crops ({counts.crops})
            </button>
            <button
              onClick={() => setActiveTab("livestocks")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "livestocks"
                  ? "bg-white text-green-700 shadow"
                  : "text-gray-600 hover:text-gray-700"
              }`}
            >
              🐄 Livestock ({counts.livestocks})
            </button>
            <button
              onClick={() => setActiveTab("lands")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "lands"
                  ? "bg-white text-green-700 shadow"
                  : "text-gray-600 hover:text-gray-700"
              }`}
            >
              🏞️ Land ({counts.lands})
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                  <div className="aspect-video bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {activeTab === "crops" ? "🌾" : activeTab === "livestocks" ? "🐄" : "🏞️"}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab} listings yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first {activeTab.slice(0, -1)} listing to start selling
              </p>
              <Link
                href="/listings/create"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create {activeTab.slice(0, -1)} listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map(renderCard)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
