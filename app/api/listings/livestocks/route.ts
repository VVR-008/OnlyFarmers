import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import LivestockListing from "@/models/LivestockListings";
import User from "@/models/User";
import { z } from "zod";

const querySchema = z.object({
  location: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  animalType: z.string().optional(),
  purpose: z.string().optional(),
  healthStatus: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  id: z.string().optional(),
});

const livestockSchema = z.object({
  title: z.string().min(1),
  animalType: z.enum(["cattle", "buffalo", "goat", "sheep", "poultry", "pig", "horse", "other"]),
  breed: z.string().min(1),
  images: z.array(z.string()).min(1),
  age: z.object({
    years: z.number().min(0),
    months: z.number().min(0).max(11),
  }),
  weight: z.number().positive().optional(),
  price: z.number().positive(),
  location: z.object({
    address: z.string().min(1),
    district: z.string().min(1),
    state: z.string().min(1),
    coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  }),
  farmer: z.string(),
  description: z.string().min(1).max(1000),
  healthStatus: z.enum(["excellent", "good", "fair", "needs_attention"]),
  vaccinated: z.boolean().default(false),
  pregnant: z.boolean().optional(),
  milkYield: z.number().positive().optional(),
  purpose: z.enum(["dairy", "meat", "breeding", "draft", "multipurpose"]),
  quantity: z.number().positive().default(1),
  certification: z.string().optional(),
  status: z.enum(["available", "sold", "reserved"]).default("available"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    await dbConnect();
    
    const query = querySchema.parse(Object.fromEntries(searchParams));

    // Individual listing request
    if (query.id) {
      const listing = await LivestockListing.findById(query.id)
        .populate("farmer", "name email phone profile");

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

    if (query.animalType) filter.animalType = query.animalType;
    if (query.purpose) filter.purpose = query.purpose;
    if (query.healthStatus) filter.healthStatus = query.healthStatus;
    
    if (query.location) {
      filter.$or = [
        { "location.district": { $regex: query.location, $options: "i" } },
        { "location.state": { $regex: query.location, $options: "i" } },
      ];
    }

    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = parseInt(query.minPrice);
      if (query.maxPrice) filter.price.$lte = parseInt(query.maxPrice);
    }

    const listings = await LivestockListing.find(filter)
      .populate("farmer", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LivestockListing.countDocuments(filter);

    return NextResponse.json({
      listings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching livestock listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    if (body.farmer) {
      const farmer = await User.findById(body.farmer);
      if (!farmer) {
        return NextResponse.json({ 
          error: "Invalid farmer ID",
          details: ["Farmer not found"]
        }, { status: 400 });
      }
    }
    
    const validatedData = livestockSchema.parse(body);
    const listing = new LivestockListing(validatedData);
    await listing.save();
    await listing.populate("farmer", "name email phone");

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error: any) {
    console.error("Livestock creation error:", error);
    
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
      error: "Failed to create livestock listing",
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

    const existingListing = await LivestockListing.findById(id);
    
    if (!existingListing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (existingListing.farmer.toString() !== userId) {
      return NextResponse.json({ 
        error: "Unauthorized: You can only edit your own listings" 
      }, { status: 403 });
    }

    const updatedListing = await LivestockListing.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).populate("farmer", "name email phone");

    return NextResponse.json({ listing: updatedListing });
  } catch (error) {
    console.error("Error updating livestock listing:", error);
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

    const listing = await LivestockListing.findById(id);
    
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.farmer.toString() !== userId) {
      return NextResponse.json({ 
        error: "Unauthorized: You can only delete your own listings" 
      }, { status: 403 });
    }

    await LivestockListing.findByIdAndDelete(id);
    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting livestock listing:", error);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
