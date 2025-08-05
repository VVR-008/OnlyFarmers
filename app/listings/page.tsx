"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { MagnifyingGlassIcon, FunnelIcon, PlusIcon } from "@heroicons/react/24/outline";
import { CurrencyRupeeIcon } from "@heroicons/react/24/solid";
import Base64Image from "@/components/ui/base64-image";

interface Listing {
  _id: string;
  title: string;
  images: string[];
  location: {
    district: string;
    state: string;
    address?: string;
  };
  status: string;
  createdAt: string;
  // Crop specific
  cropName?: string;
  price?: number;
  quantity?: {
    value: number;
    unit: string;
  };
  grade?: string;
  category?: string;
  // Livestock specific
  animalType?: string;
  breed?: string;
  purpose?: string;
  age?: {
    years: number;
    months: number;
  };
  // Land specific
  area?: {
    value: number;
    unit: string;
  };
  landType?: string;
  soilType?: string;
}

const CROP_CATEGORIES = ["grains", "vegetables", "fruits", "spices", "pulses"];
const CROP_GRADES = ["Premium", "A", "B", "C"];
const ANIMAL_TYPES = ["cattle", "buffalo", "goat", "sheep", "poultry", "pig", "horse", "other"];
const LIVESTOCK_PURPOSES = ["dairy", "meat", "breeding", "draft", "multipurpose"];
const LAND_TYPES = ["agricultural", "residential", "commercial", "industrial"];
const SOIL_TYPES = ["black", "alluvial", "red", "laterite", "sandy"];

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") || "crops";
  
  const [activeTab, setActiveTab] = useState<"crops" | "livestocks" | "lands">(
    typeParam as "crops" | "livestocks" | "lands"
  );
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    location: "",
    // Crop specific filters
    grade: "",
    category: "",
    // Livestock specific filters
    animalType: "",
    purpose: "",
    // Land specific filters
    landType: "",
    soilType: "",
  });

  useEffect(() => {
    fetchListings();
  }, [activeTab, filters, pagination.page]);

  useEffect(() => {
    // Update URL when tab changes
    const url = new URL(window.location.href);
    url.searchParams.set("type", activeTab);
    window.history.replaceState({}, "", url.toString());
  }, [activeTab]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", pagination.page.toString());
      queryParams.append("limit", pagination.limit.toString());
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/listings/${activeTab}?${queryParams}`);
      const data = await response.json();
      
      if (data.listings) {
        setListings(data.listings);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: "crops" | "livestocks" | "lands") => {
    setActiveTab(tab);
    setFilters({
      minPrice: "",
      maxPrice: "",
      location: "",
      grade: "",
      category: "",
      animalType: "",
      purpose: "",
      landType: "",
      soilType: "",
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      location: "",
      grade: "",
      category: "",
      animalType: "",
      purpose: "",
      landType: "",
      soilType: "",
    });
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const renderCropCard = (listing: Listing) => (
    <Link
      key={listing._id}
      href={`/listings/crops/${listing._id}`}
      className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden"
    >
      <div className="aspect-video bg-gray-100 overflow-hidden">
        <Base64Image
          src={listing.images?.[0]}
          alt={listing.title}
          fallbackSrc="/placeholder-crop.jpg"
          className="hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{listing.title}</h3>
        <p className="text-gray-600 text-sm mb-2 capitalize">{listing.cropName} • {listing.category}</p>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <CurrencyRupeeIcon className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-bold">
              ₹{listing.price?.toLocaleString()}/{listing.quantity?.unit}
            </span>
          </div>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {listing.grade}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{listing.quantity?.value} {listing.quantity?.unit} available</span>
          <span>{listing.location?.district}, {listing.location?.state}</span>
        </div>
      </div>
    </Link>
  );

  const renderLivestockCard = (listing: Listing) => (
    <Link
      key={listing._id}
      href={`/listings/livestocks/${listing._id}`}
      className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden"
    >
      <div className="aspect-video bg-gray-100 overflow-hidden">
        <Base64Image
          src={listing.images?.[0]}
          alt={listing.title}
          fallbackSrc="/placeholder-livestock.jpg"
          className="hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{listing.title}</h3>
        <p className="text-gray-600 text-sm mb-2 capitalize">
          {listing.animalType} • {listing.breed}
        </p>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <CurrencyRupeeIcon className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-bold">
              ₹{listing.price?.toLocaleString()}
            </span>
          </div>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full capitalize">
            {listing.purpose}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>
            {listing.age?.years}y {listing.age?.months}m old
          </span>
          <span>{listing.location?.district}, {listing.location?.state}</span>
        </div>
      </div>
    </Link>
  );

  const renderLandCard = (listing: Listing) => (
    <Link
      key={listing._id}
      href={`/listings/lands/${listing._id}`}
      className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden"
    >
      <div className="aspect-video bg-gray-100 overflow-hidden">
        <Base64Image
          src={listing.images?.[0]}
          alt={listing.title}
          fallbackSrc="/placeholder-land.jpg"
          className="hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{listing.title}</h3>
        <p className="text-gray-600 text-sm mb-2 capitalize">
          {listing.area?.value} {listing.area?.unit} • {listing.landType}
        </p>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <CurrencyRupeeIcon className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-bold">
              ₹{((listing.price || 0) / 100000).toFixed(1)}L
            </span>
          </div>
          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full capitalize">
            {listing.soilType}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{listing.area?.value} {listing.area?.unit}</span>
          <span>{listing.location?.district}, {listing.location?.state}</span>
        </div>
      </div>
    </Link>
  );

  const renderCard = (listing: Listing) => {
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">OnlyFarmers Marketplace</h1>
              <p className="text-gray-600">Discover crops, livestock, and land opportunities</p>
            </div>
            <Link
              href="/listings/create"
              className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Listing
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => handleTabChange("crops")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "crops"
                  ? "bg-white text-green-700 shadow"
                  : "text-gray-600 hover:text-gray-700"
              }`}
            >
              🌾 Crops ({activeTab === "crops" ? pagination.total : "-"})
            </button>
            <button
              onClick={() => handleTabChange("livestocks")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "livestocks"
                  ? "bg-white text-green-700 shadow"
                  : "text-gray-600 hover:text-gray-700"
              }`}
            >
              🐄 Livestock ({activeTab === "livestocks" ? pagination.total : "-"})
            </button>
            <button
              onClick={() => handleTabChange("lands")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "lands"
                  ? "bg-white text-green-700 shadow"
                  : "text-gray-600 hover:text-gray-700"
              }`}
            >
              🏞️ Land ({activeTab === "lands" ? pagination.total : "-"})
            </button>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by location (district, state)..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                  <input
                    type="number"
                    placeholder="₹0"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                  <input
                    type="number"
                    placeholder="₹∞"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Crop specific filters */}
                {activeTab === "crops" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange("category", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">All Categories</option>
                        {CROP_CATEGORIES.map(cat => (
                          <option key={cat} value={cat} className="capitalize">{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                      <select
                        value={filters.grade}
                        onChange={(e) => handleFilterChange("grade", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">All Grades</option>
                        {CROP_GRADES.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Livestock specific filters */}
                {activeTab === "livestocks" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Animal Type</label>
                      <select
                        value={filters.animalType}
                        onChange={(e) => handleFilterChange("animalType", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">All Animals</option>
                        {ANIMAL_TYPES.map(type => (
                          <option key={type} value={type} className="capitalize">{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                      <select
                        value={filters.purpose}
                        onChange={(e) => handleFilterChange("purpose", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">All Purposes</option>
                        {LIVESTOCK_PURPOSES.map(purpose => (
                          <option key={purpose} value={purpose} className="capitalize">{purpose}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Land specific filters */}
                {activeTab === "lands" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Land Type</label>
                      <select
                        value={filters.landType}
                        onChange={(e) => handleFilterChange("landType", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">All Types</option>
                        {LAND_TYPES.map(type => (
                          <option key={type} value={type} className="capitalize">{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                      <select
                        value={filters.soilType}
                        onChange={(e) => handleFilterChange("soilType", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">All Soil Types</option>
                        {SOIL_TYPES.map(soil => (
                          <option key={soil} value={soil} className="capitalize">{soil}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {pagination.total} {activeTab} {pagination.total === 1 ? 'listing' : 'listings'}
              {filters.location && ` in "${filters.location}"`}
            </p>
            <div className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </div>
          </div>

          {/* Listings Grid */}
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
                No {activeTab} listings found
              </h3>
              <p className="text-gray-500 mb-6">
                {filters.location || filters.minPrice || filters.maxPrice
                  ? "Try adjusting your filters or search terms"
                  : `Be the first to list your ${activeTab.slice(0, -1)} for sale`}
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map(renderCard)}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    const pageNum = Math.max(1, pagination.page - 2) + i;
                    if (pageNum > pagination.pages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 border rounded-md transition-colors ${
                          pageNum === pagination.page
                            ? "bg-green-600 text-white border-green-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
