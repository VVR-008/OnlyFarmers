"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { 
  ArrowLeftIcon, 
  CurrencyRupeeIcon, 
  MapPinIcon,
  UserIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

interface Listing {
  _id: string;
  title?: string;
  cropName?: string;
  animalType?: string;
  breed?: string;
  landType?: string;
  category?: string;
  description?: string;
  price?: number | { total?: number; perUnit?: number };
  quantity?: { value: number; unit: string } | number;
  area?: { value: number; unit: string };
  location?: { district: string; state: string };
  images?: string[];
  farmer?: { _id: string; name: string; email: string; phone: string };
  seller?: { _id: string; name: string; email: string; phone: string };
  status?: string;
}

export default function CreateOrderPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const listingId = searchParams.get("listing");
  const listingType = searchParams.get("type") as "crop" | "livestock" | "land";
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    quantity: 1,
    message: "",
    buyerContact: {
      name: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "buyer") {
      setError("Only buyers can place orders");
      return;
    }

    if (listingId && listingType) {
      fetchListingData();
    } else {
      setError("Invalid listing or type");
      setLoading(false);
    }
    
    // Pre-fill buyer contact if user is available
    if (user) {
      setFormData(prev => ({
        ...prev,
        buyerContact: {
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
        },
      }));
    }
  }, [listingId, listingType, user, router]);

  const fetchListingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ All endpoints are now plural
      let endpoint = "";
      switch (listingType) {
        case "crop":
          endpoint = "crops";
          break;
        case "livestock":
          endpoint = "livestocks";
          break;
        case "land":
          endpoint = "lands";
          break;
        default:
          throw new Error("Invalid listing type");
      }
      
      console.log(`🔍 Fetching from: /api/listings/${endpoint}?id=${listingId}`);
      
      const response = await fetch(`/api/listings/${endpoint}?id=${listingId}`);
      
      if (!response.ok) {
        throw new Error("Listing not found or no longer available");
      }
      
      const data = await response.json();
      console.log("📦 Received data:", data);
      
      // ✅ Handle different response structures
      const fetchedListing = data.listing || data.crop || data.livestock || data.land;
      
      if (!fetchedListing) {
        throw new Error("Listing data not found");
      }
  
      // Check if listing is available
      if (fetchedListing.status !== "available") {
        throw new Error("This listing is no longer available");
      }
      
      setListing(fetchedListing);
      
      // Set default quantity
      if (listingType === "land") {
        setFormData(prev => ({ ...prev, quantity: 1 }));
      } else if (listingType === "crop" && fetchedListing.quantity?.value) {
        setFormData(prev => ({ ...prev, quantity: Math.min(1, fetchedListing.quantity.value) }));
      } else if (listingType === "livestock" && fetchedListing.quantity) {
        setFormData(prev => ({ ...prev, quantity: Math.min(1, fetchedListing.quantity) }));
      }
      
    } catch (error: any) {
      console.error("❌ Error fetching listing:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  

  const getListingTitle = () => {
    if (!listing) return "";
    return listing.title || listing.cropName || `${listing.animalType} (${listing.breed})` || listing.landType || "Listing";
  };

  const getListingSubtitle = () => {
    if (!listing) return "";
    if (listingType === "crop") {
      return `${listing.cropName} • ${listing.category}`;
    } else if (listingType === "livestock") {
      return `${listing.animalType} • ${listing.breed}`;
    } else if (listingType === "land") {
      return `${listing.area?.value} ${listing.area?.unit} • ${listing.landType}`;
    }
    return "";
  };

  const getPrice = () => {
    if (!listing) return 0;
    
    if (listingType === "land") {
      return (listing.price as any)?.total || listing.price || 0;
    } else {
      return listing.price || 0;
    }
  };

  const getMaxQuantity = () => {
    if (!listing) return 1;
    
    if (listingType === "land") return 1;
    if (listingType === "crop") return (listing.quantity as any)?.value || 1;
    if (listingType === "livestock") return listing.quantity as number || 1;
    return 1;
  };

  const getQuantityUnit = () => {
    if (listingType === "crop") return (listing?.quantity as any)?.unit || "units";
    if (listingType === "livestock") return "animals";
    return "unit";
  };

  const calculateTotalPrice = () => {
    if (!listing) return 0;
    
    if (listingType === "land") {
      return getPrice();
    } else {
      return getPrice() * (formData.quantity || 1);
    }
  };

  const getSellerId = () => {
    if (listingType === "land") {
      return listing?.seller?._id || listing?.seller;
    } else {
      return listing?.farmer?._id || listing?.farmer;
    }
  };

  const getSellerName = () => {
    if (listingType === "land") {
      return listing?.seller?.name || "Land Owner";
    } else {
      return listing?.farmer?.name || "Farmer";
    }
  };

  const validateForm = () => {
    if (!formData.message.trim()) {
      throw new Error("Please provide a message to the seller");
    }
    
    if (!formData.buyerContact.name.trim()) {
      throw new Error("Please provide your name");
    }
    
    if (!formData.buyerContact.email.trim()) {
      throw new Error("Please provide your email");
    }
    
    if (!formData.buyerContact.phone.trim()) {
      throw new Error("Please provide your phone number");
    }
    
    if (listingType !== "land" && (!formData.quantity || formData.quantity < 1)) {
      throw new Error("Please specify a valid quantity");
    }
    
    if (formData.quantity > getMaxQuantity()) {
      throw new Error(`Maximum available quantity is ${getMaxQuantity()} ${getQuantityUnit()}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !listing) return;
    
    try {
      validateForm();
      setSubmitting(true);
      setError(null);
      
      const orderData = {
        buyer: user.id,
        seller: getSellerId(),
        listing: listingId,
        listingType,
        quantity: listingType === "land" ? 1 : formData.quantity,
        totalPrice: calculateTotalPrice(),
        message: formData.message.trim(),
        buyerContact: {
          name: formData.buyerContact.name.trim(),
          email: formData.buyerContact.email.trim(),
          phone: formData.buyerContact.phone.trim(),
        },
      };
      
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create order");
      }
      
      const result = await response.json();
      
      // Show success message
      alert(`✅ Order placed successfully! Order ID: #${result.order._id.slice(-8)}\n\nThe ${listingType === "land" ? "land owner" : "farmer"} will contact you soon.`);
      
      // Redirect to orders page
      router.push("/orders");
      
    } catch (error: any) {
      console.error("Error creating order:", error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setError(null); // Clear any existing errors
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to place an order</p>
          <Link 
            href="/login" 
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-white rounded-full shadow-lg">
            <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-green-700 font-medium">Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Listing Not Available</h2>
          <p className="text-gray-600 mb-6">{error || "The listing you're looking for is not available"}</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
            <Link
              href="/listings"
              className="flex-1 px-4 py-2 bg-green-600 text-white text-center rounded-xl hover:bg-green-700 transition-colors"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 px-4 py-2 text-green-700 hover:bg-green-100 rounded-xl transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Place Order
            </h1>
            <p className="text-gray-600 capitalize">
              {listingType} • {getListingTitle()}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Listing Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                Listing Details
              </h2>
              
              {listing.images?.[0] && (
                <div className="mb-4">
                  <img
                    src={listing.images[0]}
                    alt={getListingTitle()}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{getListingTitle()}</h3>
                  <p className="text-gray-600 text-sm">{getListingSubtitle()}</p>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                  <CurrencyRupeeIcon className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-bold text-green-700">
                    {listingType === "land" 
                      ? `₹${(getPrice() / 100000).toFixed(1)}L`
                      : `₹${getPrice().toLocaleString()}${listingType === "crop" ? `/${getQuantityUnit()}` : ""}`
                    }
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-gray-500" />
                    <span>{listing.location?.district}, {listing.location?.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <span>{getSellerName()}</span>
                  </div>
                  {listingType !== "land" && (
                    <div className="text-green-600 font-medium">
                      Available: {getMaxQuantity()} {getQuantityUnit()}
                    </div>
                  )}
                </div>

                {listing.description && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {listing.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-semibold mb-6">Order Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Quantity - Only for crops and livestock */}
                {listingType !== "land" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity ({getQuantityUnit()}) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange("quantity", Number(e.target.value))}
                        min="1"
                        max={getMaxQuantity()}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <span className="text-gray-500 text-sm">{getQuantityUnit()}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum available: {getMaxQuantity()} {getQuantityUnit()}
                    </p>
                  </div>
                )}

                {/* Total Price Display */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-green-700">
                        ₹{calculateTotalPrice().toLocaleString()}
                      </span>
                      {listingType !== "land" && formData.quantity > 1 && (
                        <p className="text-sm text-gray-600">
                          {formData.quantity} × ₹{getPrice().toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message to {listingType === "land" ? "Land Owner" : "Farmer"} *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={`Hi! I'm interested in your ${listingType}. Please share more details about availability, quality, and delivery options. When would be a good time to discuss further?`}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Introduce yourself and provide any specific requirements or questions
                  </p>
                </div>

                {/* Contact Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Your Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={formData.buyerContact.name}
                        onChange={(e) => handleInputChange("buyerContact.name", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={formData.buyerContact.email}
                        onChange={(e) => handleInputChange("buyerContact.email", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={formData.buyerContact.phone}
                        onChange={(e) => handleInputChange("buyerContact.phone", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    The {listingType === "land" ? "land owner" : "farmer"} will use these details to contact you directly
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5" />
                        Place Order - ₹{calculateTotalPrice().toLocaleString()}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}