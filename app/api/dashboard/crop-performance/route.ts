import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CropListing from "@/models/CropListing";

// Replace this with your real server-side auth/session handler!
export async function GET(request: NextRequest) {
  await dbConnect();

  // For demo: get farmer id from ?farmer=... query
  const url = new URL(request.url);
  const farmerId = url.searchParams.get("farmer");
  if (!farmerId) {
    return NextResponse.json({ error: "Farmer id required" }, { status: 400 });
  }

  // Aggregate by crop name: sum quantity & revenue
  const crops = await CropListing.aggregate([
    { $match: { farmerId: farmerId } },
    {
      $group: {
        _id: "$crop.type", // or "$cropName" if that's your field
        quantity: { $sum: "$quantity.available" },
        revenue: { $sum: "$pricing.basePrice" }, // Adjust as needed!
      },
    },
    {
      $project: {
        crop: "$_id", quantity: 1, revenue: 1, _id: 0
      },
    },
  ]);
  return NextResponse.json(crops, { status: 200 });
}
