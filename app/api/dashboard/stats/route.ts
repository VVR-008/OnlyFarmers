import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CropListing from "@/models/CropListing";
import LivestockListing from "@/models/LivestockListing";
import LandListing from "@/models/LandListing";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const farmerId = url.searchParams.get("farmerId");
    
    if (!farmerId) {
      return NextResponse.json({ error: "Farmer ID is required" }, { status: 400 });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return NextResponse.json({ error: "Invalid farmer ID" }, { status: 400 });
    }

    // Get listing counts by type
    const [cropCount, livestockCount, landCount] = await Promise.all([
      CropListing.countDocuments({ farmer: farmerId, status: "available" }),
      LivestockListing.countDocuments({ farmer: farmerId, status: "available" }),
      LandListing.countDocuments({ seller: farmerId, status: "available" }),
    ]);

    // Get total revenue from orders
    const revenueData = await Order.aggregate([
      {
        $match: {
          seller: new mongoose.Types.ObjectId(farmerId),
          status: { $in: ["completed", "accepted"] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, totalOrders: 0 };

    // Get monthly revenue for chart
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          seller: new mongoose.Types.ObjectId(farmerId),
          status: { $in: ["completed", "accepted"] },
          createdAt: {
            $gte: new Date(new Date().getFullYear(), 0, 1), // Start of current year
          }
        }
      },
      {
        $group: {
          _id: { 
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.month": 1 }
      }
    ]);

    // Format monthly data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlyData = months.map((month, index) => {
      const monthData = monthlyRevenue.find(item => item._id.month === index + 1);
      return {
        month,
        revenue: monthData?.revenue || 0,
        orders: monthData?.orders || 0
      };
    });

    // Get total views (simulate for now, you can implement actual view tracking)
    const totalViews = await CropListing.aggregate([
      { $match: { farmer: new mongoose.Types.ObjectId(farmerId) } },
      { $group: { _id: null, views: { $sum: { $ifNull: ["$views", 0] } } } }
    ]);

    const stats = {
      totalRevenue: revenue.totalRevenue,
      totalOrders: revenue.totalOrders,
      activeListings: cropCount + livestockCount + landCount,
      totalViews: totalViews[0]?.views || Math.floor(Math.random() * 3000) + 500, // Simulate until you implement view tracking
    };

    const listingBreakdown = [];
    if (cropCount > 0) listingBreakdown.push({ name: 'Crops', value: cropCount });
    if (livestockCount > 0) listingBreakdown.push({ name: 'Livestock', value: livestockCount });
    if (landCount > 0) listingBreakdown.push({ name: 'Land', value: landCount });

    return NextResponse.json({
      stats,
      listingBreakdown,
      monthlyRevenue: formattedMonthlyData,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
