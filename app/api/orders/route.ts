import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import CropListing from "@/models/CropListings";
import LivestockListing from "@/models/LivestockListings";
import LandListing from "@/models/LandListings";
import { z } from "zod";

const orderSchema = z.object({
  buyer: z.string().min(1),
  seller: z.string().min(1),
  listing: z.string().min(1),
  listingType: z.enum(["crop", "livestock", "land"]),
  quantity: z.number().positive().optional(),
  totalPrice: z.number().positive(),
  message: z.string().min(1).max(1000),
  buyerContact: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
  }),
});

const querySchema = z.object({
  user: z.string().optional(),
  role: z.enum(["buyer", "seller"]).optional(),
  status: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));
    
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");
    const skip = (page - 1) * limit;
    
    let filter: any = {};
    
    if (query.user && query.role) {
      if (query.role === "buyer") {
        filter.buyer = query.user;
      } else if (query.role === "seller") {
        filter.seller = query.user;
      }
    }
    
    if (query.status) {
      filter.status = query.status;
    }
    
    // ✅ Fixed: Simple populate without nested paths
    const orders = await Order.find(filter)
      .populate("buyer", "name email phone")
      .populate("seller", "name email phone")
      .populate("listing") // Just populate the listing, not nested fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Order.countDocuments(filter);
    
    return NextResponse.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const validatedData = orderSchema.parse(body);
    
    // Verify buyer and seller exist and check roles
    const [buyer, seller] = await Promise.all([
      User.findById(validatedData.buyer),
      User.findById(validatedData.seller),
    ]);
    
    if (!buyer || !seller) {
      return NextResponse.json({ error: "Invalid buyer or seller" }, { status: 400 });
    }
    
    // Ensure buyer is actually a buyer
    if (buyer.role !== "buyer") {
      return NextResponse.json({ 
        error: "Only buyers can place orders",
        details: ["User must have buyer role to create orders"]
      }, { status: 403 });
    }
    
    // Ensure seller is actually a farmer
    if (seller.role !== "farmer") {
      return NextResponse.json({ 
        error: "Orders can only be placed to farmers",
        details: ["Seller must be a farmer"]
      }, { status: 400 });
    }
    
    // Prevent buyers from ordering from themselves
    if (validatedData.buyer === validatedData.seller) {
      return NextResponse.json({ 
        error: "Cannot place order to yourself" 
      }, { status: 400 });
    }
    
    // Verify listing exists and is available
    let listing;
    if (validatedData.listingType === "crop") {
      listing = await CropListing.findById(validatedData.listing);
    } else if (validatedData.listingType === "livestock") {
      listing = await LivestockListing.findById(validatedData.listing);
    } else if (validatedData.listingType === "land") {
      listing = await LandListing.findById(validatedData.listing);
    }
    
    if (!listing || listing.status !== "available") {
      return NextResponse.json({ error: "Listing not available" }, { status: 400 });
    }
    
    // Verify listing ownership matches the seller
    const listingOwnerId = validatedData.listingType === "land" 
      ? listing.seller.toString() 
      : listing.farmer.toString();
      
    if (listingOwnerId !== validatedData.seller) {
      return NextResponse.json({ 
        error: "Seller ID doesn't match listing owner" 
      }, { status: 400 });
    }
    
    // Create order
    const order = new Order(validatedData);
    await order.save();
    
    // Populate for response
    await order.populate([
      { path: "buyer", select: "name email phone" },
      { path: "seller", select: "name email phone" },
      { path: "listing" },
    ]);
    
    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to create order",
      details: [error.message]
    }, { status: 500 });
  }
}
