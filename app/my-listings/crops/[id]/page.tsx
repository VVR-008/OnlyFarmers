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

// Enums for crop listing
const CROP_CATEGORIES = [
  { label: "Grains", value: "grains" },
  { label: "Vegetables", value: "vegetables" },
  { label: "Fruits", value: "fruits" },
  { label: "Spices", value: "spices" },
  { label: "Pulses", value: "pulses" },
];

const CROP_GRADES = ["Premium", "A", "B", "C"];

export default function EditCropPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const cropId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    cropName: "",
    images: ["", "", ""],
    description: "",
    category: "grains",
    quantity: "",
    unit: "kg",
    price: "",
    grade: "A",
    organicCertified: false,
    harvestDate: "",
    locationVillage: "",
    locationDistrict: "",
    locationState: "",
  });

  // Track which images are uploaded files vs URLs
  const [imageTypes, setImageTypes] = useState<("file" | "url" | null)[]>([null, null, null]);

  useEffect(() => {
    fetchCropData();
  }, [cropId]);

  const fetchCropData = async () => {
    try {
      const response = await fetch(`/api/listings/crops?id=${cropId}`, {
        headers: {
          "x-user-id": user?.id || "",
        },
      });
      if (!response.ok) {
        throw new Error('Crop not found');
      }
      const data = await response.json();
      const crop = data.listing;

      // Check if user owns this listing
      if (crop.farmer !== user?.id) {
        router.push('/my-listings');
        return;
      }

      // Parse location
      const locationParts = crop.location.address?.split(", ") || [];
      const [village, district, state] = locationParts;

      setFormData({
        title: crop.title || "",
        cropName: crop.cropName || "",
        images: crop.images || ["", "", ""],
        description: crop.description || "",
        category: crop.category || "grains",
        quantity: crop.quantity?.value?.toString() || "",
        unit: crop.quantity?.unit || "kg",
        price: crop.price?.toString() || "",
        grade: crop.grade || "A",
        organicCertified: crop.organicCertified || false,
        harvestDate: crop.harvestDate ? new Date(crop.harvestDate).toISOString().split('T')[0] : "",
        locationVillage: village || "",
        locationDistrict: district || crop.location.district || "",
        locationState: state || crop.location.state || "",
      });

      // Set image types (assume all are URLs for existing listings)
      setImageTypes(crop.images?.map(() => "url") || [null, null, null]);

    } catch (error) {
      console.error('Error fetching crop:', error);
      setError('Failed to load crop data');
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

      const response = await fetch(`/api/listings/crops?id=${cropId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({
          title: formData.title,
          cropName: formData.cropName,
          images: formData.images.filter(Boolean),
          description: formData.description,
          category: formData.category,
          quantity: {
            value: Number(formData.quantity),
            unit: formData.unit,
          },
          price: Number(formData.price),
          grade: formData.grade,
          organicCertified: formData.organicCertified,
          harvestDate: formData.harvestDate ? new Date(formData.harvestDate) : undefined,
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
          router.push('/my-listings?type=crops');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update listing');
      }
    } catch (error) {
      console.error('Error updating crop:', error);
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
              href="/my-listings?type=crops"
              className="flex items-center gap-2 text-green-700 hover:text-green-800"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to My Listings
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Edit Crop Listing</h1>
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

              <div>
                <label className="block font-medium mb-1">Crop Name*</label>
                <input
                  type="text"
                  value={formData.cropName}
                  onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Category*</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input w-full"
                  required
                >
                  {CROP_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Quantity*</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Unit*</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="input w-full"
                    required
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                    <option value="ton">ton</option>
                    <option value="pieces">pieces</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Price per Unit (₹)*</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Grade*</label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="input w-full"
                  required
                >
                  {CROP_GRADES.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="organicCertified"
                  checked={formData.organicCertified}
                  onChange={(e) => setFormData({ ...formData, organicCertified: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="organicCertified" className="text-sm">Organic Certified</label>
              </div>

              <div>
                <label className="block font-medium mb-1">Harvest Date</label>
                <input
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                  className="input w-full"
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
                  placeholder="Provide detailed information about your crop"
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
              href="/my-listings?type=crops"
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