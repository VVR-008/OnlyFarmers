import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CropListing from "@/models/CropListings";
import LivestockListing from "@/models/LivestockListings";
import LandListing from "@/models/LandListings";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get("farmer"); // ✅ Back to simple "farmer"
    
    console.log("📊 Fetching counts for farmer:", farmerId);
    
    if (!farmerId) {
      return NextResponse.json({ error: "farmer ID is required" }, { status: 400 });
    }

    const [cropsCount, livestockCount, landCount] = await Promise.all([
      CropListing.countDocuments({ farmer: farmerId }),
      LivestockListing.countDocuments({ farmer: farmerId }),
      LandListing.countDocuments({ seller: farmerId }),
    ]);

    const counts = {
      crops: cropsCount,
      livestock: livestockCount,
      land: landCount,
      total: cropsCount + livestockCount + landCount,
    };

    console.log("✅ Counts:", counts);
    return NextResponse.json({ counts });
  } catch (error) {
    console.error("❌ Error fetching counts:", error);
    return NextResponse.json({ error: "Failed to fetch counts" }, { status: 500 });
  }
}
