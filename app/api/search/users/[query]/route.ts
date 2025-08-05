import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: { query: string } }
) {
  try {
    await dbConnect();
    
    // Extract parameters from URL path and query params
    const query = decodeURIComponent(params.query || "");
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role") || "";
    const limit = parseInt(searchParams.get("limit") || "10");
    
    console.log("Search API called with:", { query, role, limit });
    
    // Build search filter
    const filter: any = {};
    
    if (query && query !== "undefined") {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ];
    }
    
    if (role && (role === "farmer" || role === "buyer")) {
      filter.role = role;
    }
    
    console.log("Search filter:", filter);
    
    // Get total users in DB for debugging
    const totalUsers = await User.countDocuments({});
    console.log("Total users in database:", totalUsers);
    
    // Search users
    const users = await User.find(filter)
      .select("name email role phone isVerified createdAt")
      .limit(limit)
      .sort({ createdAt: -1 });
    
    console.log("Found users:", users.length);
    if (users.length > 0) {
      console.log("Sample user:", users[0]);
    }
    
    return NextResponse.json({
      success: true,
      users: users.map((user: any) => ({
        id: user._id.toString(),
        name: user.name || "Unknown",
        email: user.email || "",
        role: user.role || "buyer",
        phone: user.phone || "",
        isVerified: user.isVerified || false,
        createdAt: user.createdAt
      }))
    });
    
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search users" },
      { status: 500 }
    );
  }
} 