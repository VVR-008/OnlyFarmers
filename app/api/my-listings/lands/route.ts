import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import LandListing from "@/models/LandListings";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const farmerId = request.nextUrl.searchParams.get("farmer._id");
    
    console.log("🏞️ Fetching land for farmer._id:", farmerId);
    
    if (!farmerId) {
      return NextResponse.json({ error: "farmer._id is required" }, { status: 400 });
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
