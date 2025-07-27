"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { PlusIcon } from "@heroicons/react/24/outline";
import { CurrencyRupeeIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

// Enums for all listing types
const CROP_CATEGORIES = [
  { label: "Grains", value: "grains" },
  { label: "Vegetables", value: "vegetables" },
  { label: "Fruits", value: "fruits" },
  { label: "Spices", value: "spices" },
  { label: "Pulses", value: "pulses" },
];

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

export default function CreateListingPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"crop" | "livestock" | "land">("crop");

  // Crop state
  const [cropFields, setCropFields] = useState({
    title: "",
    cropName: "",
    images: [""],
    description: "",
    category: CROP_CATEGORIES[0].value,
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

  // Livestock state
  const [livestockFields, setLivestockFields] = useState({
    title: "",
    animalType: ANIMAL_TYPES[0].value,
    breed: "",
    images: [""],
    ageYears: "",
    ageMonths: "",
    weight: "",
    price: "",
    description: "",
    healthStatus: HEALTH_STATUS[0].value,
    vaccinated: false,
    pregnant: false,
    milkYield: "",
    purpose: LIVESTOCK_PURPOSES[0].value,
    quantity: "1",
    certification: "",
    locationVillage: "",
    locationDistrict: "",
    locationState: "",
  });

  // Land state
  const [landFields, setLandFields] = useState({
    title: "",
    images: [""],
    description: "",
    area: "",
    areaUnit: "acres",
    priceTotal: "",
    soilType: "black",
    irrigation: "borewell",
    landType: "agricultural",
    roadAccess: false,
    electricityConnection: false,
    locationVillage: "",
    locationDistrict: "",
    locationState: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleImageChange = (idx: number, url: string, type: "crop" | "livestock" | "land") => {
    if (type === "crop") {
      setCropFields(f => ({
        ...f,
        images: f.images.map((img, i) => (i === idx ? url : img)),
      }));
    } else if (type === "livestock") {
      setLivestockFields(f => ({
        ...f,
        images: f.images.map((img, i) => (i === idx ? url : img)),
      }));
    } else {
      setLandFields(f => ({
        ...f,
        images: f.images.map((img, i) => (i === idx ? url : img)),
      }));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!user || !user.id) {
      setError("Authentication is required to create a listing.");
      return;
    }

    setPending(true);
    try {
      let res;
      
      if (activeTab === "crop") {
        const address = [
          cropFields.locationVillage,
          cropFields.locationDistrict,
          cropFields.locationState,
        ].filter(Boolean).join(", ");

        res = await fetch("/api/listings/crops", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: cropFields.title,
            cropName: cropFields.cropName,
            images: cropFields.images.filter(Boolean),
            description: cropFields.description,
            category: cropFields.category,
            quantity: {
              value: Number(cropFields.quantity),
              unit: cropFields.unit,
            },
            price: Number(cropFields.price),
            grade: cropFields.grade,
            organicCertified: cropFields.organicCertified,
            harvestDate: cropFields.harvestDate ? new Date(cropFields.harvestDate) : undefined,
            location: {
              address,
              district: cropFields.locationDistrict,
              state: cropFields.locationState,
            },
            farmer: user.id,
          }),
        });
      } else if (activeTab === "livestock") {
        const address = [
          livestockFields.locationVillage,
          livestockFields.locationDistrict,
          livestockFields.locationState,
        ].filter(Boolean).join(", ");

        res = await fetch("/api/listings/livestocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: livestockFields.title,
            animalType: livestockFields.animalType,
            breed: livestockFields.breed,
            images: livestockFields.images.filter(Boolean),
            age: {
              years: Number(livestockFields.ageYears),
              months: Number(livestockFields.ageMonths),
            },
            weight: livestockFields.weight ? Number(livestockFields.weight) : undefined,
            price: Number(livestockFields.price),
            description: livestockFields.description,
            healthStatus: livestockFields.healthStatus,
            vaccinated: livestockFields.vaccinated,
            pregnant: livestockFields.pregnant,
            milkYield: livestockFields.milkYield ? Number(livestockFields.milkYield) : undefined,
            purpose: livestockFields.purpose,
            quantity: Number(livestockFields.quantity),
            certification: livestockFields.certification,
            location: {
              address,
              district: livestockFields.locationDistrict,
              state: livestockFields.locationState,
            },
            farmer: user.id,
          }),
        });
      } else {
        // Land listing
        const address = [
          landFields.locationVillage,
          landFields.locationDistrict,
          landFields.locationState,
        ].filter(Boolean).join(", ");

        res = await fetch("/api/listings/lands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: landFields.title,
            images: landFields.images.filter(Boolean),
            description: landFields.description,
            area: {
              value: Number(landFields.area),
              unit: landFields.areaUnit,
            },
            price: {
              total: Number(landFields.priceTotal),
            },
            soilType: landFields.soilType,
            irrigation: landFields.irrigation,
            landType: landFields.landType,
            roadAccess: landFields.roadAccess,
            electricityConnection: landFields.electricityConnection,
            location: {
              address,
              village: landFields.locationVillage,
              district: landFields.locationDistrict,
              state: landFields.locationState,
            },
            seller: user.id,
          }),
        });
      }

      if (!res?.ok) {
        const payload = await res?.json();
        setError(payload.error || "Failed to create listing.");
        setPending(false);
        return;
      }

      router.replace(`/listings?type=${activeTab}`);
    } catch (err: any) {
      setError(err?.message || "Listing creation failed.");
    } finally {
      setPending(false);
    }
  }

  if (!user || (user.role !== "farmer" && user.role !== "land_man")) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg text-gray-600">
        <span>
          Only farmers and land owners can create listings.{" "}
          <Link href="/login" className="text-green-700 underline">
            Login
          </Link>
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-4xl mx-auto px-4 pt-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Create New Listing</h1>
            <p className="text-gray-500">Sell your crops, livestock, or land on OnlyFarmers</p>
          </div>
          <Link href="/listings" className="rounded bg-white border px-4 py-2 font-semibold text-green-700 hover:bg-green-50 border-green-200">
            Back to Listings
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          <button
            className={`px-4 py-2 rounded font-semibold ${
              activeTab === "crop"
                ? "bg-green-600 text-white shadow"
                : "bg-white border text-green-700 border-green-200 hover:bg-green-50"
            }`}
            onClick={() => setActiveTab("crop")}
            type="button"
          >
            🌾 Crop Listing
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold ${
              activeTab === "livestock"
                ? "bg-green-600 text-white shadow"
                : "bg-white border text-green-700 border-green-200 hover:bg-green-50"
            }`}
            onClick={() => setActiveTab("livestock")}
            type="button"
          >
            🐄 Livestock
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold ${
              activeTab === "land"
                ? "bg-green-600 text-white shadow"
                : "bg-white border text-green-700 border-green-200 hover:bg-green-50"
            }`}
            onClick={() => setActiveTab("land")}
            type="button"
          >
            🏞️ Land/Plot
          </button>
        </div>

        <form className="rounded-lg bg-white shadow p-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}

          {/* CROP FORM */}
          {activeTab === "crop" && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-1">Title*</label>
                  <input
                    className="input"
                    value={cropFields.title}
                    onChange={e => setCropFields({ ...cropFields, title: e.target.value })}
                    required
                    placeholder="Premium Basmati Rice"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Crop Name*</label>
                  <input
                    className="input"
                    value={cropFields.cropName}
                    onChange={e => setCropFields({ ...cropFields, cropName: e.target.value })}
                    required
                    placeholder="Rice, Wheat, Tomato"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Category*</label>
                  <select
                    className="input"
                    value={cropFields.category}
                    onChange={e => setCropFields({ ...cropFields, category: e.target.value })}
                  >
                    {CROP_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Grade*</label>
                  <select
                    className="input"
                    value={cropFields.grade}
                    onChange={e => setCropFields({ ...cropFields, grade: e.target.value })}
                  >
                    <option value="Premium">Premium</option>
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Quantity*</label>
                  <div className="flex gap-2">
                    <input
                      className="input flex-1"
                      type="number"
                      min={1}
                      value={cropFields.quantity}
                      onChange={e => setCropFields({ ...cropFields, quantity: e.target.value })}
                      required
                    />
                    <select
                      className="input"
                      value={cropFields.unit}
                      onChange={e => setCropFields({ ...cropFields, unit: e.target.value })}
                    >
                      <option value="kg">kg</option>
                      <option value="quintal">Quintal</option>
                      <option value="ton">Ton</option>
                      <option value="bag">Bag</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Price (per unit)*</label>
                  <div className="flex items-center gap-2">
                    <CurrencyRupeeIcon className="h-5 w-5 text-gray-400" />
                    <input
                      className="input flex-1"
                      type="number"
                      min={1}
                      value={cropFields.price}
                      onChange={e => setCropFields({ ...cropFields, price: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Harvest Date</label>
                  <input
                    className="input"
                    type="date"
                    value={cropFields.harvestDate}
                    onChange={e => setCropFields({ ...cropFields, harvestDate: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={cropFields.organicCertified}
                      onChange={e => setCropFields({ ...cropFields, organicCertified: e.target.checked })}
                    />
                    <span className="font-semibold">Organic Certified</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* LIVESTOCK FORM */}
          {activeTab === "livestock" && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-1">Title*</label>
                  <input
                    className="input"
                    value={livestockFields.title}
                    onChange={e => setLivestockFields({ ...livestockFields, title: e.target.value })}
                    required
                    placeholder="Healthy Holstein Cow"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Animal Type*</label>
                  <select
                    className="input"
                    value={livestockFields.animalType}
                    onChange={e => setLivestockFields({ ...livestockFields, animalType: e.target.value })}
                  >
                    {ANIMAL_TYPES.map(animal => (
                      <option key={animal.value} value={animal.value}>{animal.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Breed*</label>
                  <input
                    className="input"
                    value={livestockFields.breed}
                    onChange={e => setLivestockFields({ ...livestockFields, breed: e.target.value })}
                    required
                    placeholder="Holstein, Gir, Murrah"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Age*</label>
                  <div className="flex gap-2">
                    <input
                      className="input flex-1"
                      type="number"
                      min={0}
                      value={livestockFields.ageYears}
                      onChange={e => setLivestockFields({ ...livestockFields, ageYears: e.target.value })}
                      placeholder="Years"
                      required
                    />
                    <input
                      className="input flex-1"
                      type="number"
                      min={0}
                      max={11}
                      value={livestockFields.ageMonths}
                      onChange={e => setLivestockFields({ ...livestockFields, ageMonths: e.target.value })}
                      placeholder="Months"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Weight (kg)</label>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={livestockFields.weight}
                    onChange={e => setLivestockFields({ ...livestockFields, weight: e.target.value })}
                    placeholder="300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Price*</label>
                  <div className="flex items-center gap-2">
                    <CurrencyRupeeIcon className="h-5 w-5 text-gray-400" />
                    <input
                      className="input flex-1"
                      type="number"
                      min={1}
                      value={livestockFields.price}
                      onChange={e => setLivestockFields({ ...livestockFields, price: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Health Status*</label>
                  <select
                    className="input"
                    value={livestockFields.healthStatus}
                    onChange={e => setLivestockFields({ ...livestockFields, healthStatus: e.target.value })}
                  >
                    {HEALTH_STATUS.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Purpose*</label>
                  <select
                    className="input"
                    value={livestockFields.purpose}
                    onChange={e => setLivestockFields({ ...livestockFields, purpose: e.target.value })}
                  >
                    {LIVESTOCK_PURPOSES.map(purpose => (
                      <option key={purpose.value} value={purpose.value}>{purpose.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Quantity*</label>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={livestockFields.quantity}
                    onChange={e => setLivestockFields({ ...livestockFields, quantity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Milk Yield (liters/day)</label>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    value={livestockFields.milkYield}
                    onChange={e => setLivestockFields({ ...livestockFields, milkYield: e.target.value })}
                    placeholder="15"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold mb-1">Certification/Documents</label>
                  <input
                    className="input"
                    value={livestockFields.certification}
                    onChange={e => setLivestockFields({ ...livestockFields, certification: e.target.value })}
                    placeholder="Veterinary certificates, breeding records"
                  />
                </div>
                <div className="col-span-2 flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={livestockFields.vaccinated}
                      onChange={e => setLivestockFields({ ...livestockFields, vaccinated: e.target.checked })}
                    />
                    <span className="font-semibold">Vaccinated</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={livestockFields.pregnant}
                      onChange={e => setLivestockFields({ ...livestockFields, pregnant: e.target.checked })}
                    />
                    <span className="font-semibold">Pregnant (if applicable)</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* LAND FORM */}
          {activeTab === "land" && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-1">Title*</label>
                  <input
                    className="input"
                    value={landFields.title}
                    onChange={e => setLandFields({ ...landFields, title: e.target.value })}
                    required
                    placeholder="2.5 Acre Irrigated Land"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Area*</label>
                  <div className="flex gap-2">
                    <input
                      className="input flex-1"
                      type="number"
                      min={0.01}
                      value={landFields.area}
                      onChange={e => setLandFields({ ...landFields, area: e.target.value })}
                      required
                    />
                    <select
                      className="input"
                      value={landFields.areaUnit}
                      onChange={e => setLandFields({ ...landFields, areaUnit: e.target.value })}
                    >
                      <option value="acres">Acres</option>
                      <option value="hectares">Hectares</option>
                      <option value="bigha">Bigha</option>
                      <option value="sq_ft">Sq Ft</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Price (Total)*</label>
                  <div className="flex items-center gap-2">
                    <CurrencyRupeeIcon className="h-5 w-5 text-gray-400" />
                    <input
                      className="input flex-1"
                      type="number"
                      min={1000}
                      value={landFields.priceTotal}
                      onChange={e => setLandFields({ ...landFields, priceTotal: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Land Type*</label>
                  <select
                    className="input"
                    value={landFields.landType}
                    onChange={e => setLandFields({ ...landFields, landType: e.target.value })}
                  >
                    <option value="agricultural">Agricultural</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Soil Type</label>
                  <select
                    className="input"
                    value={landFields.soilType}
                    onChange={e => setLandFields({ ...landFields, soilType: e.target.value })}
                  >
                    <option value="black">Black</option>
                    <option value="alluvial">Alluvial</option>
                    <option value="red">Red</option>
                    <option value="laterite">Laterite</option>
                    <option value="sandy">Sandy</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Irrigation</label>
                  <select
                    className="input"
                    value={landFields.irrigation}
                    onChange={e => setLandFields({ ...landFields, irrigation: e.target.value })}
                  >
                    <option value="borewell">Borewell</option>
                    <option value="canal">Canal</option>
                    <option value="river">River</option>
                    <option value="rainwater">Rainwater</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div className="col-span-2 flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={landFields.roadAccess}
                      onChange={e => setLandFields({ ...landFields, roadAccess: e.target.checked })}
                    />
                    <span className="font-semibold">Road Access</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={landFields.electricityConnection}
                      onChange={e => setLandFields({ ...landFields, electricityConnection: e.target.checked })}
                    />
                    <span className="font-semibold">Electricity Connection</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Common fields: Images, Description, Location */}
          <div className="space-y-6">
            <div>
              <label className="block font-semibold mb-1">Images* (URLs for demo)</label>
              {[0, 1, 2].map((idx) => (
                <input
                  className="input mt-1"
                  type="url"
                  key={idx}
                  placeholder="Paste image URL or leave blank"
                  value={
                    activeTab === "crop" 
                      ? cropFields.images[idx] || ""
                      : activeTab === "livestock"
                      ? livestockFields.images[idx] || ""
                      : landFields.images[idx] || ""
                  }
                  onChange={e => handleImageChange(idx, e.target.value, activeTab)}
                />
              ))}
            </div>

            <div>
              <label className="block font-semibold mb-1">Description*</label>
              <textarea
                className="input"
                value={
                  activeTab === "crop" 
                    ? cropFields.description
                    : activeTab === "livestock"
                    ? livestockFields.description
                    : landFields.description
                }
                onChange={e => {
                  if (activeTab === "crop") {
                    setCropFields({ ...cropFields, description: e.target.value });
                  } else if (activeTab === "livestock") {
                    setLivestockFields({ ...livestockFields, description: e.target.value });
                  } else {
                    setLandFields({ ...landFields, description: e.target.value });
                  }
                }}
                rows={3}
                placeholder={`Describe your ${activeTab}...`}
                required
              />
            </div>

            {/* Location fields */}
            <div>
              <h3 className="font-semibold mb-3">Location</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block font-semibold mb-1">Village</label>
                  <input
                    className="input"
                    value={
                      activeTab === "crop" 
                        ? cropFields.locationVillage
                        : activeTab === "livestock"
                        ? livestockFields.locationVillage
                        : landFields.locationVillage
                    }
                    onChange={e => {
                      if (activeTab === "crop") {
                        setCropFields({ ...cropFields, locationVillage: e.target.value });
                      } else if (activeTab === "livestock") {
                        setLivestockFields({ ...livestockFields, locationVillage: e.target.value });
                      } else {
                        setLandFields({ ...landFields, locationVillage: e.target.value });
                      }
                    }}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">District*</label>
                  <input
                    className="input"
                    value={
                      activeTab === "crop" 
                        ? cropFields.locationDistrict
                        : activeTab === "livestock"
                        ? livestockFields.locationDistrict
                        : landFields.locationDistrict
                    }
                    onChange={e => {
                      if (activeTab === "crop") {
                        setCropFields({ ...cropFields, locationDistrict: e.target.value });
                      } else if (activeTab === "livestock") {
                        setLivestockFields({ ...livestockFields, locationDistrict: e.target.value });
                      } else {
                        setLandFields({ ...landFields, locationDistrict: e.target.value });
                      }
                    }}
                    required
                    placeholder="E.g. Nashik"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">State*</label>
                  <input
                    className="input"
                    value={
                      activeTab === "crop" 
                        ? cropFields.locationState
                        : activeTab === "livestock"
                        ? livestockFields.locationState
                        : landFields.locationState
                    }
                    onChange={e => {
                      if (activeTab === "crop") {
                        setCropFields({ ...cropFields, locationState: e.target.value });
                      } else if (activeTab === "livestock") {
                        setLivestockFields({ ...livestockFields, locationState: e.target.value });
                      } else {
                        setLandFields({ ...landFields, locationState: e.target.value });
                      }
                    }}
                    required
                    placeholder="Maharashtra"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              type="submit"
              disabled={pending}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded shadow disabled:opacity-60 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              {pending ? "Creating..." : `Create ${activeTab === "crop" ? "Crop" : activeTab === "livestock" ? "Livestock" : "Land"} Listing`}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .input {
          @apply w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 transition;
        }
      `}</style>
    </div>
  );
}
