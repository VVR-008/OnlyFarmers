import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import CropListing from "@/models/CropListings";
import LivestockListing from "@/models/LivestockListings";
import LandListing from "@/models/LandListings";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get("farmerId");
    
    if (!farmerId) {
      return NextResponse.json({ error: "Farmer ID is required" }, { status: 400 });
    }

    console.log("🔍 Fetching dashboard stats for farmer:", farmerId);

    // Fetch all data in parallel
    const [
      totalOrders,
      acceptedOrders,
      completedOrders,
      cropListings,
      livestockListings,
      landListings,
      recentOrders
    ] = await Promise.all([
      // Total orders received by this farmer
      Order.countDocuments({ seller: farmerId }),
      
      // Accepted orders for revenue calculation
      Order.find({ seller: farmerId, status: "accepted" }),
      
      // Completed orders
      Order.countDocuments({ seller: farmerId, status: "completed" }),
      
      // Active listings counts
      CropListing.find({ farmer: farmerId, status: "available" }),
      LivestockListing.find({ farmer: farmerId, status: "available" }),
      LandListing.find({ seller: farmerId, status: "available" }),
      
      // Recent orders for monthly data
      Order.find({ seller: farmerId })
        .populate("listing")
        .sort({ createdAt: -1 })
        .limit(50)
    ]);

    // Calculate total revenue from accepted/completed orders
    const totalRevenue = acceptedOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Create listing breakdown
    const listingBreakdown = [];
    if (cropListings.length > 0) {
      listingBreakdown.push({ name: "Crops", value: cropListings.length });
    }
    if (livestockListings.length > 0) {
      listingBreakdown.push({ name: "Livestocks", value: livestockListings.length });
    }
    if (landListings.length > 0) {
      listingBreakdown.push({ name: "Lands", value: landListings.length });
    }

    // Generate monthly revenue data (last 6 months)
    const monthlyRevenue = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthOrders = recentOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });
      
      const monthRevenue = monthOrders
        .filter(order => order.status === "accepted" || order.status === "completed")
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
      
      monthlyRevenue.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthRevenue,
        orders: monthOrders.length
      });
    }

    // Calculate total views (mock data for now - you can implement view tracking later)
    const totalViews = (cropListings.length + livestockListings.length + landListings.length) * 15;

    const stats = {
      totalRevenue,
      totalOrders,
      activeListings: cropListings.length + livestockListings.length + landListings.length,
      totalViews,
    };

    console.log("✅ Dashboard stats calculated:", stats);
    console.log("📊 Listing breakdown:", listingBreakdown);

    return NextResponse.json({
      stats,
      listingBreakdown,
      monthlyRevenue,
    });

  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
