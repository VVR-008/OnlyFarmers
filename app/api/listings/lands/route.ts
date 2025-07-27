import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import LandListing from "@/models/LandListing";
import User from "@/models/User";
import { z } from "zod";

const querySchema = z.object({
  location: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  landType: z.string().optional(),
  soilType: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  id: z.string().optional(),
});

const landSchema = z.object({
  title: z.string().min(1),
  landType: z.enum(["agricultural", "residential", "commercial", "industrial"]),
  area: z.object({
    value: z.number().positive(),
    unit: z.enum(["acres", "hectares", "bigha", "sq_ft"]),
  }),
  soilType: z.string().optional(),
  irrigation: z.string().optional(),
  roadAccess: z.boolean().default(false),
  electricityConnection: z.boolean().default(false),
  images: z.array(z.string()).min(1),
  price: z.object({
    total: z.number().positive(),
  }),
  location: z.object({
    address: z.string().min(1),
    village: z.string().min(1),
    district: z.string().min(1),
    state: z.string().min(1),
    coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  }),
  seller: z.string(),
  description: z.string().min(1).max(1000),
  status: z.enum(["available", "sold", "under_offer"]).default("available"),
});

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    // Individual listing request
    if (query.id) {
      const listing = await LandListing.findById(query.id)
        .populate("seller", "name email phone profile");

      if (!listing) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 });
      }

      return NextResponse.json({ listing });
    }

    // List of listings
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "12");
    const skip = (page - 1) * limit;

    const filter: any = { status: "available" };

    if (query.landType) filter.landType = query.landType;
    if (query.soilType) filter.soilType = query.soilType;
    
    if (query.location) {
      filter.$or = [
        { "location.district": { $regex: query.location, $options: "i" } },
        { "location.state": { $regex: query.location, $options: "i" } },
      ];
    }

    if (query.minPrice || query.maxPrice) {
      filter["price.total"] = {};
      if (query.minPrice) filter["price.total"].$gte = parseInt(query.minPrice);
      if (query.maxPrice) filter["price.total"].$lte = parseInt(query.maxPrice);
    }

    const listings = await LandListing.find(filter)
      .populate("seller", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LandListing.countDocuments(filter);

    return NextResponse.json({
      listings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching land listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    if (body.seller) {
      const seller = await User.findById(body.seller);
      if (!seller) {
        return NextResponse.json({ 
          error: "Invalid seller ID",
          details: ["Seller not found"]
        }, { status: 400 });
      }
    }
    
    const validatedData = landSchema.parse(body);
    const listing = new LandListing(validatedData);
    await listing.save();
    await listing.populate("seller", "name email phone");

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error: any) {
    console.error("Land creation error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      }, { status: 400 });
    }
    
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((e: any) => e.message);
      return NextResponse.json({ 
        error: "Database validation failed",
        details: validationErrors
      }, { status: 400 });
    }

    if (error.name === "CastError") {
      return NextResponse.json({ 
        error: "Invalid data format",
        details: [`Invalid ${error.path}: ${error.value}`]
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to create land listing",
      details: [error.message]
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = request.headers.get("x-user-id");
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }
    
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const existingListing = await LandListing.findById(id);
    
    if (!existingListing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (existingListing.seller.toString() !== userId) {
      return NextResponse.json({ 
        error: "Unauthorized: You can only edit your own listings" 
      }, { status: 403 });
    }

    const updatedListing = await LandListing.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).populate("seller", "name email phone");

    return NextResponse.json({ listing: updatedListing });
  } catch (error) {
    console.error("Error updating land listing:", error);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = request.headers.get("x-user-id");
    
    if (!id) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }
    
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const listing = await LandListing.findById(id);
    
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.seller.toString() !== userId) {
      return NextResponse.json({ 
        error: "Unauthorized: You can only delete your own listings" 
      }, { status: 403 });
    }

    await LandListing.findByIdAndDelete(id);
    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting land listing:", error);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
