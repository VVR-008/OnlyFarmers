"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { CurrencyRupeeIcon } from "@heroicons/react/24/solid";
import Base64Image from "@/components/ui/base64-image";

// Enums for livestock listing
const ANIMAL_TYPES = [
  { label: "Cattle", value: "cattle" },
  { label: "Buffalo", value: "buffalo" },
  { label: "Goat", value: "goat" },
  { label: "Sheep", value: "sheep" },
  { label: "Poultry", value: "poultry" },
  { label: "Pig", value: "pig" },
  { label: "Horse", value: "horse" },
  { label: "Other", value: "other" },
];

const LIVESTOCK_PURPOSES = [
  { label: "Dairy", value: "dairy" },
  { label: "Meat", value: "meat" },
  { label: "Breeding", value: "breeding" },
  { label: "Draft", value: "draft" },
  { label: "Multipurpose", value: "multipurpose" },
];

const HEALTH_STATUS = [
  { label: "Excellent", value: "excellent" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
  { label: "Needs Attention", value: "needs_attention" },
];

export default function EditLivestockPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const livestockId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    animalType: "cattle",
    breed: "",
    images: ["", "", ""],
    ageYears: "",
    ageMonths: "",
    weight: "",
    price: "",
    description: "",
    healthStatus: "excellent",
    vaccinated: false,
    pregnant: false,
    milkYield: "",
    purpose: "dairy",
    quantity: "1",
    certification: "",
    locationVillage: "",
    locationDistrict: "",
    locationState: "",
  });

  // Track which images are uploaded files vs URLs
  const [imageTypes, setImageTypes] = useState<("file" | "url" | null)[]>([null, null, null]);

  useEffect(() => {
    fetchLivestockData();
  }, [livestockId]);

  const fetchLivestockData = async () => {
    try {
      const response = await fetch(`/api/listings/livestocks?id=${livestockId}`, {
        headers: {
          "x-user-id": user?.id || "",
        },
      });
      if (!response.ok) {
        throw new Error('Livestock not found');
      }
      const data = await response.json();
      const livestock = data.listing;

      // Check if user owns this listing
      if (livestock.farmer !== user?.id) {
        router.push('/my-listings');
        return;
      }

      // Parse location
      const locationParts = livestock.location.address?.split(", ") || [];
      const [village, district, state] = locationParts;

      setFormData({
        title: livestock.title || "",
        animalType: livestock.animalType || "cattle",
        breed: livestock.breed || "",
        images: livestock.images || ["", "", ""],
        ageYears: livestock.age?.years?.toString() || "",
        ageMonths: livestock.age?.months?.toString() || "",
        weight: livestock.weight?.toString() || "",
        price: livestock.price?.toString() || "",
        description: livestock.description || "",
        healthStatus: livestock.healthStatus || "excellent",
        vaccinated: livestock.vaccinated || false,
        pregnant: livestock.pregnant || false,
        milkYield: livestock.milkYield?.toString() || "",
        purpose: livestock.purpose || "dairy",
        quantity: livestock.quantity?.toString() || "1",
        certification: livestock.certification || "",
        locationVillage: village || "",
        locationDistrict: district || livestock.location.district || "",
        locationState: state || livestock.location.state || "",
      });

      // Set image types (assume all are URLs for existing listings)
      setImageTypes(livestock.images?.map(() => "url") || [null, null, null]);

    } catch (error) {
      console.error('Error fetching livestock:', error);
      setError('Failed to load livestock data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (idx: number, fileOrUrl: File | string) => {
    let imageUrl = fileOrUrl;

    if (fileOrUrl instanceof File) {
      // Compress and convert file to base64
      const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          img.onload = () => {
            // Calculate new dimensions (max 800px width/height)
            const maxSize = 800;
            let { width, height } = img;
            
            if (width > height) {
              if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Convert to base64 with quality 0.8 (80%)
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            resolve(compressedBase64);
          };
          
          img.src = URL.createObjectURL(file);
        });
      };
      
      try {
        const compressedBase64 = await compressImage(fileOrUrl);
        
        // Update image type to "file"
        setImageTypes(prev => prev.map((t, i) => i === idx ? "file" : t));
        
        setFormData(f => ({
          ...f,
          images: f.images.map((img, i) => i === idx ? compressedBase64 : img),
        }));
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original method if compression fails
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64String = e.target?.result as string;
          setImageTypes(prev => prev.map((t, i) => i === idx ? "file" : t));
          
          setFormData(f => ({
            ...f,
            images: f.images.map((img, i) => i === idx ? base64String : img),
          }));
        };
        reader.readAsDataURL(fileOrUrl);
      }
      return;
    }

    // Handle URL input
    setImageTypes(prev => prev.map((t, i) => i === idx ? "url" : t));
    
    setFormData(f => ({
      ...f,
      images: f.images.map((img, i) => i === idx ? (imageUrl as string) : img),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const address = [
        formData.locationVillage,
        formData.locationDistrict,
        formData.locationState,
      ].filter(Boolean).join(", ");

      const response = await fetch(`/api/listings/livestocks?id=${livestockId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({
          title: formData.title,
          animalType: formData.animalType,
          breed: formData.breed,
          images: formData.images.filter(Boolean),
          age: {
            years: Number(formData.ageYears),
            months: Number(formData.ageMonths),
          },
          weight: formData.weight ? Number(formData.weight) : undefined,
          price: Number(formData.price),
          description: formData.description,
          healthStatus: formData.healthStatus,
          vaccinated: formData.vaccinated,
          pregnant: formData.pregnant,
          milkYield: formData.milkYield ? Number(formData.milkYield) : undefined,
          purpose: formData.purpose,
          quantity: Number(formData.quantity),
          certification: formData.certification,
          location: {
            address,
            district: formData.locationDistrict,
            state: formData.locationState,
          },
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/my-listings?type=livestocks');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update listing');
      }
    } catch (error) {
      console.error('Error updating livestock:', error);
      setError('Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-b-2 border-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/my-listings" className="text-green-600 hover:underline">
            Back to My Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/my-listings?type=livestocks"
              className="flex items-center gap-2 text-green-700 hover:text-green-800"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to My Listings
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Edit Livestock Listing</h1>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Listing Updated Successfully!</h3>
              <p className="text-green-700">Redirecting to My Listings...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block font-medium mb-1">Title*</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Animal Type*</label>
                  <select
                    value={formData.animalType}
                    onChange={(e) => setFormData({ ...formData, animalType: e.target.value })}
                    className="input w-full"
                    required
                  >
                    {ANIMAL_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Breed*</label>
                  <input
                    type="text"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium mb-1">Age (Years)</label>
                  <input
                    type="number"
                    value={formData.ageYears}
                    onChange={(e) => setFormData({ ...formData, ageYears: e.target.value })}
                    className="input w-full"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Age (Months)</label>
                  <input
                    type="number"
                    value={formData.ageMonths}
                    onChange={(e) => setFormData({ ...formData, ageMonths: e.target.value })}
                    className="input w-full"
                    min="0"
                    max="11"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="input w-full"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Price (₹)*</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Purpose*</label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="input w-full"
                    required
                  >
                    {LIVESTOCK_PURPOSES.map(purpose => (
                      <option key={purpose.value} value={purpose.value}>{purpose.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Quantity*</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="input w-full"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Health Status*</label>
                <select
                  value={formData.healthStatus}
                  onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
                  className="input w-full"
                  required
                >
                  {HEALTH_STATUS.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="vaccinated"
                    checked={formData.vaccinated}
                    onChange={(e) => setFormData({ ...formData, vaccinated: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="vaccinated" className="text-sm">Vaccinated</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pregnant"
                    checked={formData.pregnant}
                    onChange={(e) => setFormData({ ...formData, pregnant: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="pregnant" className="text-sm">Pregnant</label>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Milk Yield (liters/day)</label>
                <input
                  type="number"
                  value={formData.milkYield}
                  onChange={(e) => setFormData({ ...formData, milkYield: e.target.value })}
                  className="input w-full"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Certification</label>
                <input
                  type="text"
                  value={formData.certification}
                  onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                  className="input w-full"
                  placeholder="Any certifications or special notes"
                />
              </div>
            </div>

            {/* Images and Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Images & Description</h3>
              
              {/* Images */}
              <div>
                <label className="block font-medium mb-2">Images</label>
                {[0, 1, 2].map((idx) => {
                  const currentImage = formData.images[idx];
                  const imageType = imageTypes[idx];
                  
                  return (
                    <div className="flex gap-3 items-center mb-3" key={idx}>
                      {/* URL Input - Only show if no file is uploaded */}
                      {imageType !== "file" && (
                        <input
                          className="input flex-1"
                          type="url"
                          placeholder="Paste image URL or upload file below"
                          value={currentImage || ""}
                          onChange={e => handleImageChange(idx, e.target.value)}
                        />
                      )}
                      
                      {/* Upload Button */}
                      <div className="flex gap-2">
                        <label 
                          htmlFor={`file-upload-${idx}`}
                          className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          {imageType === "file" ? "Change File" : "Upload File"}
                        </label>
                        <input
                          id={`file-upload-${idx}`}
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={async e => {
                            if (!e.target.files?.length) return;
                            const file = e.target.files[0];
                            await handleImageChange(idx, file);
                            e.target.value = "";
                          }}
                        />
                        
                        {/* Remove Button - Only show if image exists */}
                        {currentImage && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(f => ({
                                ...f,
                                images: f.images.map((img, i) => i === idx ? "" : img)
                              }));
                              setImageTypes(prev => prev.map((t, i) => i === idx ? null : t));
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-medium transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      {/* Image Preview */}
                      {currentImage && (
                        <div className="relative">
                          {currentImage?.match(/\.(jpeg|jpg|png|gif|webp)$/i) || currentImage?.startsWith('data:image/') ? (
                            <img src={currentImage} alt="preview" className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200" />
                          ) : currentImage?.match(/\.(mp4|mov|webm|m4v)$/i) ? (
                            <video src={currentImage} className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200" controls />
                          ) : null}
                          
                          {/* File type indicator */}
                          {imageType && (
                            <div className={`absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full ${
                              imageType === "file" ? "bg-green-500 text-white" : "bg-blue-500 text-white"
                            }`}>
                              {imageType === "file" ? "File" : "URL"}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block font-medium mb-1">Description*</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input h-32 w-full"
                  required
                  placeholder="Provide detailed information about your livestock"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium mb-1">Village</label>
                <input
                  type="text"
                  value={formData.locationVillage}
                  onChange={(e) => setFormData({ ...formData, locationVillage: e.target.value })}
                  className="input w-full"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">District*</label>
                <input
                  type="text"
                  value={formData.locationDistrict}
                  onChange={(e) => setFormData({ ...formData, locationDistrict: e.target.value })}
                  className="input w-full"
                  required
                  placeholder="E.g. Nashik"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">State*</label>
                <input
                  type="text"
                  value={formData.locationState}
                  onChange={(e) => setFormData({ ...formData, locationState: e.target.value })}
                  className="input w-full"
                  required
                  placeholder="E.g. Maharashtra"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update Listing"}
            </button>
            <Link
              href="/my-listings?type=livestocks"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 