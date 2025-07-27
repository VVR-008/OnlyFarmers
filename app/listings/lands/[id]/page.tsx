//app/

import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import LandListing from "@/models/LandListing";
import { CurrencyRupeeIcon, MapPinIcon, UserIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default async function LandDetailPage({ params }: { params: { id: string } }) {
  await dbConnect();
  // Lean mode so we can access fields cleanly
  const land = await LandListing.findById(params.id)
    .populate("seller", "name email phone")
    .lean();

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

  const readableStatus = (status: string) => {
    if (status === "available") return "Available";
    if (status === "under_offer") return "Under Offer";
    if (status === "sold") return "Sold";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link href="/listings?type=lands" className="text-green-700 hover:underline">&larr; Back to Listings</Link>
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          {land.images && land.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {land.images.map((img: string, i: number) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={img}
                    alt={`${land.title} - Image ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
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

            <div className="flex flex-wrap items-center gap-6 mb-4 border-t pt-4 text-sm">
              {land.location?.village && <div><span className="text-gray-500">Village:</span> {land.location.village}</div>}
              {land.location?.district && <div><span className="text-gray-500">District:</span> {land.location.district}</div>}
              {land.location?.state && <div><span className="text-gray-500">State:</span> {land.location.state}</div>}
              {/* You may want to display more location/geocoordinate fields */}
            </div>

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
              {land.status === "available" && (
                <Link
                  href={`/orders/create?listing=${land._id}`}
                  className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 font-bold"
                >
                  Express Interest / Contact Seller
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
