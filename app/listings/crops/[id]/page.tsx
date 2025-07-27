import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import CropListing from "@/models/CropListing";
import { CurrencyRupeeIcon, MapPinIcon, UserIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default async function CropDetailPage({ params }: { params: { id: string } }) {
  await dbConnect();
  
  const crop = await CropListing.findById(params.id)
    .populate("farmer", "name email phone")
    .lean();

  if (!crop) return notFound();

  const formatGrade = (grade: string) => {
    if (grade === "Premium") return "Premium";
    return `Grade ${grade}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link href="/listings?type=crops" className="text-green-700 hover:underline">
          ← Back to Crop Listings
        </Link>
        
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          {/* Images */}
          {crop.images && crop.images.length > 0 && (
            <div className="w-full aspect-video bg-gray-100 flex items-center justify-center relative">
              <img
                src={crop.images[0]}
                alt={crop.cropName}
                className="object-cover w-full h-full"
              />
              {crop.images.length > 1 && (
                <div className="absolute bottom-2 right-2 flex gap-2">
                  {crop.images.slice(0, 3).map((img: string, i: number) => (
                    <img key={i} src={img} className="h-10 w-16 rounded object-cover border-2 border-white shadow" alt="" />
                  ))}
                  {crop.images.length > 3 && (
                    <span className="text-xs text-gray-500 bg-white rounded px-1">
                      +{crop.images.length - 3}
                    </span>
                  )}
                </div>
              )}
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
              {crop.status === "available" && (
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
