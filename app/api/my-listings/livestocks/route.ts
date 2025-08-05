import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import LivestockListing from "@/models/LivestockListings";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const farmerId = request.nextUrl.searchParams.get("farmer._id");
    
    console.log("🐄 Fetching livestock for farmer._id:", farmerId);
    
    if (!farmerId) {
      return NextResponse.json({ error: "farmer._id is required" }, { status: 400 });
    }

    const listings = await LivestockListing.find({ farmer: farmerId })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${listings.length} livestock listings`);
    return NextResponse.json({ listings });
  } catch (error) {
    console.error("❌ Error fetching livestock:", error);
    return NextResponse.json({ error: "Failed to fetch livestock" }, { status: 500 });
  }
}
