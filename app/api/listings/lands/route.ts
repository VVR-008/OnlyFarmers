import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import LandListing from "@/models/LandListings"; // ✅ Correct plural import
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
  status: z.string().optional(), // Added status property
});

const landSchema = z.object({
  title: z.string().min(1, "Title is required"),
  landType: z.enum(["agricultural", "residential", "commercial", "industrial"]),
  area: z.object({
    value: z.number().positive("Area value must be positive"),
    unit: z.enum(["acres", "hectares", "bigha", "sq_ft"]),
  }),
  soilType: z.string().optional(),
  irrigation: z.string().optional(),
  roadAccess: z.boolean().default(false),
  electricityConnection: z.boolean().default(false),
  images: z.array(z.string()).min(1, "At least one image is required"),
  price: z.object({
    total: z.number().positive("Price must be positive"),
  }),
  location: z.object({
    address: z.string().min(1, "Address is required"),
    village: z.string().min(1, "Village is required"),
    district: z.string().min(1, "District is required"),
    state: z.string().min(1, "State is required"),
    coordinates: z.object({ 
      lat: z.number(), 
      lng: z.number() 
    }).optional(),
  }),
  seller: z.string().min(1, "Seller ID is required"),
  description: z.string().min(1, "Description is required").max(1000, "Description too long"),
  status: z.enum(["available", "sold", "under_offer"]).default("available"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    console.log("🌍 Lands API GET called");
    await dbConnect();
    
    const query = querySchema.parse(Object.fromEntries(searchParams));

    console.log("🔍 Lands API - Query params:", query);

    // Individual listing request
    if (query.id) {
      console.log("📦 Fetching single land with ID:", query.id);
      
      // Validate ObjectId format
      if (!query.id.match(/^[0-9a-fA-F]{24}$/)) {
        console.error("❌ Invalid ObjectId format:", query.id);
        return NextResponse.json({ error: "Invalid listing ID format" }, { status: 400 });
      }
      
      const listing = await LandListing.findById(query.id)
        .populate("seller", "name email phone profile");

      if (!listing) {
        console.error("❌ Land listing not found with ID:", query.id);
        return NextResponse.json({ error: "Land listing not found" }, { status: 404 });
      }

      console.log("✅ Found land listing:", listing.title);
      
      // ✅ Return both keys for compatibility with order creation
      return NextResponse.json({ 
        listing, 
        land: listing  // Include both for compatibility
      });
    }

    // List of listings
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "12", 10);
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = { status: query.status || "available" };

    if (query.landType) filter.landType = query.landType;
    if (query.soilType) filter.soilType = { $regex: query.soilType, $options: "i" };
    
    if (query.location) {
      filter.$or = [
        { "location.district": { $regex: query.location, $options: "i" } },
        { "location.state": { $regex: query.location, $options: "i" } },
        { "location.village": { $regex: query.location, $options: "i" } },
        { "location.address": { $regex: query.location, $options: "i" } },
      ];
    }

    if (query.minPrice || query.maxPrice) {
      filter["price.total"] = {};
      if (query.minPrice) filter["price.total"].$gte = parseInt(query.minPrice, 10);
      if (query.maxPrice) filter["price.total"].$lte = parseInt(query.maxPrice, 10);
    }

    console.log("🔍 Applying filter:", filter);

    const listings = await LandListing.find(filter)
      .populate("seller", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LandListing.countDocuments(filter);

    console.log(`✅ Found ${listings.length} land listings (${total} total)`);

    return NextResponse.json({
      listings,
      lands: listings, // ✅ Include both keys for compatibility
      pagination: { 
        page, 
        limit, 
        total, 
        pages: Math.ceil(total / limit) 
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching land listings:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid query parameters", 
        details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to fetch land listings",
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Lands API POST called");
    await dbConnect();
    
    const body = await request.json();
    console.log("📝 Creating new land listing:", body.title);
    
    // Validate seller exists
    if (body.seller) {
      const seller = await User.findById(body.seller);
      if (!seller) {
        return NextResponse.json({ 
          error: "Invalid seller ID",
          details: ["Seller not found"]
        }, { status: 400 });
      }
      
      console.log("✅ Seller validated:", seller.name);
    }
    
    // Validate and create listing
    const validatedData = landSchema.parse(body);
    const listing = new LandListing(validatedData);
    await listing.save();
    await listing.populate("seller", "name email phone");

    console.log("✅ Created land listing:", listing._id);

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error: any) {
    console.error("❌ Land creation error:", error);
    
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
    console.log("✏️ Lands API PUT called");
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

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: "Invalid listing ID format" }, { status: 400 });
    }

    const existingListing = await LandListing.findById(id);
    
    if (!existingListing) {
      return NextResponse.json({ error: "Land listing not found" }, { status: 404 });
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

    console.log("✅ Updated land listing:", updatedListing._id);

    return NextResponse.json({ listing: updatedListing });
  } catch (error: any) {
    console.error("❌ Error updating land listing:", error);
    
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((e: any) => e.message);
      return NextResponse.json({ 
        error: "Validation failed",
        details: validationErrors
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to update land listing",
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("🗑️ Lands API DELETE called");
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

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: "Invalid listing ID format" }, { status: 400 });
    }

    const listing = await LandListing.findById(id);
    
    if (!listing) {
      return NextResponse.json({ error: "Land listing not found" }, { status: 404 });
    }

    if (listing.seller.toString() !== userId) {
      return NextResponse.json({ 
        error: "Unauthorized: You can only delete your own listings" 
      }, { status: 403 });
    }

    await LandListing.findByIdAndDelete(id);
    
    console.log("✅ Deleted land listing:", id);
    
    return NextResponse.json({ message: "Land listing deleted successfully" });
  } catch (error: any) {
    console.error("❌ Error deleting land listing:", error);
    return NextResponse.json({ 
      error: "Failed to delete land listing",
      details: error.message 
    }, { status: 500 });
  }
}
