"use client";

import { useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { CurrencyRupeeIcon, MapPinIcon, UserIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function CropDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [crop, setCrop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCropData();
  }, [params.id]);

  const fetchCropData = async () => {
    try {
      const response = await fetch(`/api/listings/crops?id=${params.id}`);
      if (!response.ok) {
        throw new Error('Crop not found');
      }
      const data = await response.json();
      setCrop(data.listing);
    } catch (error) {
      console.error('Error fetching crop:', error);
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

  if (!crop) return notFound();

  const isOwner = user?.id && crop.farmer && (
    user.id === crop.farmer._id || 
    user.id === crop.farmer || 
    (typeof crop.farmer === 'object' && user.id === crop.farmer.id)
  );

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/listings/crops?id=${params.id}`, {
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

  const formatGrade = (grade: string) => {
    if (grade === "Premium") return "Premium";
    return `Grade ${grade}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/my-listings?type=crops" className="text-green-700 hover:underline">
            ← Back to Crop Listings
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
          {/* Images */}
          {crop.images && crop.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {crop.images.map((img: string, i: number) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={img}
                    alt={`${crop.cropName} - Image ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
              <h1 className="text-2xl font-bold flex-1">{crop.cropName}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ml-2 mt-3 md:mt-0
                ${crop.status === "available" ? "bg-green-100 text-green-800" : 
                  crop.status === "sold" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                {crop.status.charAt(0).toUpperCase() + crop.status.slice(1)}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CurrencyRupeeIcon className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-bold text-green-700">
                    ₹{crop.price.toLocaleString()}/{crop.quantity.unit}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Available:</span>
                  <span className="font-bold">{crop.quantity.value} {crop.quantity.unit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Grade:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {formatGrade(crop.grade)}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{crop.location.address}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {crop.location.district}, {crop.location.state}
                </div>
              </div>
            </div>

            <div className="text-gray-700 mb-6 whitespace-pre-line">
              {crop.description}
            </div>

            {crop.farmer && (
              <div className="mt-6 bg-gray-50 border rounded px-4 py-3 flex items-center gap-3 text-gray-700">
                <UserIcon className="h-6 w-6 text-green-600" />
                <div>
                  <strong>{crop.farmer.name}</strong>
                  <div className="text-xs">
                    {crop.farmer.email} 
                    {crop.farmer.phone && ` • ${crop.farmer.phone}`}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-4">
              <Link 
                href="/listings?type=crops" 
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-200 font-medium"
              >
                Back to Crops
              </Link>
              {crop.status === "available" && !isOwner && (
                <Link
                  href={`/orders/create?listing=${crop._id}&type=crop`}
                  className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 font-bold"
                >
                  Buy Now / Contact Farmer
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}