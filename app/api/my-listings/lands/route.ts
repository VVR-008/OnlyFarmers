import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import LandListing from "@/models/LandListings";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get("farmer._id"); // ✅ Changed to farmer._id
    
    console.log("🏞️ Fetching land for farmer:", farmerId);
    
    if (!farmerId) {
      return NextResponse.json({ error: "farmer ID is required" }, { status: 400 });
    }

    const listings = await LandListing.find({ seller: farmerId })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${listings.length} land listings`);
    return NextResponse.json({ listings });
  } catch (error) {
    console.error("❌ Error fetching land:", error);
    return NextResponse.json({ error: "Failed to fetch land" }, { status: 500 });
  }
}
