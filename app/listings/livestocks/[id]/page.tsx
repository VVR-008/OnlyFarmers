"use client";

import { useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { CurrencyRupeeIcon, MapPinIcon, UserIcon, TrashIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import Base64Image from "@/components/ui/base64-image";
import LocationDisplay from "@/components/ui/location-display";

export default function LivestockDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [livestock, setLivestock] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    fetchLivestockData();
  }, [params.id]);

  const fetchLivestockData = async () => {
    try {
      // ✅ FIXED: Use existing route with query parameter
      const response = await fetch(`/api/listings/livestocks?id=${params.id}`);
      if (!response.ok) {
        throw new Error('Livestock not found');
      }
      const data = await response.json();
      setLivestock(data.listing);
    } catch (error) {
      console.error('Error fetching livestock:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      // ✅ FIXED: Use existing route with query parameter
      const response = await fetch(`/api/listings/livestocks?id=${params.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
      });

      if (response.ok) {
        alert("Listing deleted successfully!");
        router.push("/my-listings");
      } else {
        const error = await response.json();
        alert(`Failed to delete listing: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete listing. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleContactSeller = async () => {
    if (!user) {
      alert("Please log in to contact the seller");
      return;
    }

    setContacting(true);
    try {
      const farmerId = typeof livestock.farmer === 'object' ? livestock.farmer._id : livestock.farmer;
      
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          otherUserId: farmerId,
          listingId: livestock._id,
          listingType: 'livestock',
          initialMessage: `Hi! I'm interested in your ${livestock.title} listing. Can you tell me more about it?`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/messages?conversation=${data.conversationId}`);
      } else {
        const error = await response.json();
        if (error.message === "Conversation already exists") {
          // Find existing conversation and redirect to it
          const conversationsResponse = await fetch("/api/conversations", {
            headers: {
              "x-user-id": user.id,
            },
          });
          if (conversationsResponse.ok) {
            const conversationsData = await conversationsResponse.json();
            const existingConv = conversationsData.conversations.find(
              (conv: any) => conv.listingId?._id === livestock._id
            );
            if (existingConv) {
              router.push(`/messages?conversation=${existingConv._id}`);
              return;
            }
          }
        }
        alert("Failed to start conversation. Please try again.");
      }
    } catch (error) {
      console.error("Error contacting seller:", error);
      alert("Failed to contact seller. Please try again.");
    } finally {
      setContacting(false);
    }
  };

  const formatAge = (years: number, months: number) => {
    const parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    return parts.join(' ') || '0 months';
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'needs_attention': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-b-2 border-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!livestock) return notFound();

  const isOwner = user?.id && livestock.farmer && (
    user.id === livestock.farmer._id || 
    user.id === livestock.farmer || 
    (typeof livestock.farmer === 'object' && user.id === livestock.farmer.id)
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-6">
          {/* ✅ FIXED: Use correct URL (livestocks plural) */}
          <Link href="/my-listings?type=livestocks" className="text-green-700 hover:underline">
            ← Back to Livestock
          </Link>
          
          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4" />
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          {livestock.images && livestock.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {livestock.images.map((img: string, i: number) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Base64Image
                    src={img}
                    alt={`${livestock.title} - Image ${i + 1}`}
                    fallbackSrc="/placeholder-livestock.jpg"
                    className="hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
              <h1 className="text-2xl font-bold flex-1">{livestock.title}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ml-2 mt-3 md:mt-0
                ${livestock.status === "available" ? "bg-green-100 text-green-800" : 
                  livestock.status === "sold" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                {livestock.status.charAt(0).toUpperCase() + livestock.status.slice(1)}
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CurrencyRupeeIcon className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-bold text-green-700">
                    ₹{livestock.price.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Animal: </span>
                  <span className="font-semibold capitalize">{livestock.animalType}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Breed: </span>
                  <span className="font-semibold">{livestock.breed}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Age: </span>
                  <span className="font-semibold">{formatAge(livestock.age.years, livestock.age.months)}</span>
                </div>
              </div>

              <div className="space-y-3">
                {livestock.weight && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Weight: </span>
                    <span className="font-semibold">{livestock.weight} kg</span>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-600">Quantity: </span>
                  <span className="font-semibold">{livestock.quantity}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Purpose: </span>
                  <span className="font-semibold capitalize">{livestock.purpose}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Health: </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(livestock.healthStatus)}`}>
                    {livestock.healthStatus.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 text-sm">{livestock.location.address}</span>
                </div>
                {livestock.milkYield && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Milk Yield: </span>
                    <span className="font-semibold">{livestock.milkYield} L/day</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {livestock.vaccinated && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Vaccinated
                    </span>
                  )}
                  {livestock.pregnant && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                      🤰 Pregnant
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-gray-700 mb-6 whitespace-pre-line">
              {livestock.description}
            </div>

            {/* Enhanced Location Display */}
            {livestock.location && (
              <LocationDisplay
                location={{
                  latitude: livestock.location.latitude || 0,
                  longitude: livestock.location.longitude || 0,
                  address: livestock.location.fullAddress || livestock.location.address || "",
                  village: livestock.location.village || "",
                  district: livestock.location.district || "",
                  state: livestock.location.state || "",
                  pincode: livestock.location.pincode || "",
                }}
                farmerName={livestock.farmer?.name}
                farmerPhone={livestock.farmer?.phone}
                farmerEmail={livestock.farmer?.email}
                className="mb-6"
                isBuyerView={!isOwner && user?.role === "buyer"}
              />
            )}

            {livestock.certification && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Certification & Documents</h3>
                <p className="text-blue-800">{livestock.certification}</p>
              </div>
            )}

            {livestock.farmer && (
              <div className="mt-6 bg-gray-50 border rounded px-4 py-3 flex items-center gap-3 text-gray-700">
                <UserIcon className="h-6 w-6 text-green-600" />
                <div>
                  <strong>{livestock.farmer.name || 'Farmer'}</strong>
                  <div className="text-xs">
                    {livestock.farmer.email && livestock.farmer.email} 
                    {livestock.farmer.phone && ` • ${livestock.farmer.phone}`}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-4">
              {/* ✅ FIXED: Use correct URL (livestocks plural) */}
              <Link 
                href="/listings?type=livestocks" 
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-200 font-medium"
              >
                Back to Livestock
              </Link>
              {livestock.status === "available" && !isOwner && (
                <>
                  <button
                    onClick={handleContactSeller}
                    disabled={contacting}
                    className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 font-bold disabled:opacity-50 flex items-center gap-2"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    {contacting ? "Starting Chat..." : "Contact Seller"}
                  </button>
                  <Link
                    href={`/orders/create?listing=${livestock._id}&type=livestock`}
                    className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 font-bold"
                  >
                    Make Offer
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
