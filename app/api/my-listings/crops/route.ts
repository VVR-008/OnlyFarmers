import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CropListing from "@/models/CropListings";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const farmerId = request.nextUrl.searchParams.get("farmer._id");
    
    console.log("🌾 Fetching crops for farmer:", farmerId);
    
    if (!farmerId) {
      return NextResponse.json({ error: "farmer ID is required" }, { status: 400 });
    }

    const listings = await CropListing.find({ farmer: farmerId })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${listings.length} crop listings`);
    return NextResponse.json({ listings });
  } catch (error) {
    console.error("❌ Error fetching crops:", error);
    return NextResponse.json({ error: "Failed to fetch crops" }, { status: 500 });
  }
}
