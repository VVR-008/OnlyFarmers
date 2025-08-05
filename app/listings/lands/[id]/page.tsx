"use client";

import { useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { CurrencyRupeeIcon, MapPinIcon, UserIcon, TrashIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import Base64Image from "@/components/ui/base64-image";
import LocationDisplay from "@/components/ui/location-display";

export default function LandDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [land, setLand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    fetchLandData();
  }, [params.id]);

  const fetchLandData = async () => {
    try {
      const response = await fetch(`/api/listings/lands?id=${params.id}`);
      if (!response.ok) {
        throw new Error('Land not found');
      }
      const data = await response.json();
      setLand(data.listing);
    } catch (error) {
      console.error('Error fetching land:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-b-2 border-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!land) return notFound();

  // Enum/label helpers (match your creation enums: use your actual schema values!)
  const readableUnit = (unit: string) => {
    switch (unit) {
      case "acres": return "Acres";
      case "hectares": return "Hectares";
      case "bigha": return "Bigha";
      default: return unit;
    }
  };
  const isOwner = user?.id && land.seller && (
    user.id === land.seller._id || 
    user.id === land.seller || 
    (typeof land.seller === 'object' && user.id === land.seller.id)
  );
  const readableStatus = (status: string) => {
    if (status === "available") return "Available";
    if (status === "under_offer") return "Under Offer";
    if (status === "sold") return "Sold";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/listings/lands?id=${params.id}`, {
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
      const sellerId = typeof land.seller === 'object' ? land.seller._id : land.seller;
      
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          otherUserId: sellerId,
          listingId: land._id,
          listingType: 'land',
          initialMessage: `Hi! I'm interested in your ${land.title} listing. Can you tell me more about it?`
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
              (conv: any) => conv.listingId?._id === land._id
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

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/my-listings?type=lands" className="text-green-700 hover:underline">&larr; Back to Listings</Link>
          
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
          {land.images && land.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {land.images.map((img: string, i: number) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Base64Image
                    src={img}
                    alt={`${land.title} - Image ${i + 1}`}
                    fallbackSrc="/placeholder-land.jpg"
                    className="hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
              <h1 className="text-2xl font-bold flex-1">{land.title}</h1>
              <span className={
                `inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ml-2 mt-3 md:mt-0
                ${land.status === "available"
                  ? "bg-green-100 text-green-800"
                  : land.status === "under_offer"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"}`
              }>
                {readableStatus(land.status)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-6 my-4 text-gray-700">
              <div className="flex items-center gap-2">
                <CurrencyRupeeIcon className="h-5 w-5 text-green-600" />
                <span className="text-lg font-bold text-green-700">
                  {(land.price?.total / 1e5).toLocaleString()} Lakh
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {land.location?.address || [land.location?.village, land.location?.district, land.location?.state].filter(Boolean).join(", ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {land.area.value} {readableUnit(land.area.unit)}
                </span>
              </div>
              {land.soilType && (
                <div className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                  <span>Soil:</span> <span className="font-bold">{land.soilType.charAt(0).toUpperCase() + land.soilType.slice(1)}</span>
                </div>
              )}
              {land.irrigation && (
                <div className="inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-xs">
                  <span>Irrigation:</span> <span className="font-bold">{land.irrigation.charAt(0).toUpperCase() + land.irrigation.slice(1)}</span>
                </div>
              )}
            </div>

            {land.description && (
              <div className="text-gray-700 mb-6 whitespace-pre-line">
                {land.description}
              </div>
            )}

            {/* Enhanced Location Display */}
            {land.location && (
              <LocationDisplay
                location={{
                  latitude: land.location.latitude || 0,
                  longitude: land.location.longitude || 0,
                  address: land.location.fullAddress || land.location.address || "",
                  village: land.location.village || "",
                  district: land.location.district || "",
                  state: land.location.state || "",
                  pincode: land.location.pincode || "",
                }}
                farmerName={land.seller?.name}
                farmerPhone={land.seller?.phone}
                farmerEmail={land.seller?.email}
                className="mb-6"
                isBuyerView={!isOwner && user?.role === "buyer"}
              />
            )}

            {land.seller && (
              <div className="mt-6 bg-gray-50 border rounded px-4 py-2 flex items-center gap-3 text-gray-700">
                <UserIcon className="h-6 w-6 text-green-600" />
                <div>
                  <strong>{land.seller.name}</strong>
                  <div className="text-xs">{land.seller.email} {land.seller.phone && <>- {land.seller.phone}</>}</div>
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-4">
              <Link href="/listings?type=lands" className="bg-gray-100 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-200 font-medium">Back to All Land</Link>

              {land.status === "available" && !isOwner && (
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
                    href={`/orders/create?listing=${land._id}&type=land`}
                    className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 font-bold"
                  >
                    Express Interest
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