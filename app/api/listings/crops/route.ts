import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CropListing from "@/models/CropListing";
import User from "@/models/User";
import { z } from "zod";

const querySchema = z.object({
  location: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  grade: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  id: z.string().optional(), // For individual listing operations
});

const cropListingSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  cropName: z.string().min(1, "Crop name is required").trim(),
  images: z.array(z.string()).min(1, "At least one image is required"),
  description: z.string().min(1, "Description is required").max(1000, "Description too long"),
  category: z.enum(["grains", "vegetables", "fruits", "spices", "pulses"], {
    errorMap: () => ({ message: "Category must be grains, vegetables, fruits, spices, or pulses" })
  }),
  quantity: z.object({
    value: z.number().positive("Quantity must be positive"),
    unit: z.enum(["kg", "quintal", "ton", "bag"], {
      errorMap: () => ({ message: "Unit must be kg, quintal, ton, or bag" })
    }),
  }),
  price: z.number().positive("Price must be positive"),
  grade: z.enum(["A", "B", "C", "Premium"], {
    errorMap: () => ({ message: "Grade must be A, B, C, or Premium" })
  }),
  location: z.object({
    address: z.string().min(1, "Address is required"),
    district: z.string().min(1, "District is required"),
    state: z.string().min(1, "State is required"),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }),
  farmer: z.string().min(1, "Farmer ID is required"),
  status: z.enum(["available", "sold", "reserved"]).default("available"),
  organicCertified: z.boolean().default(false),
  harvestDate: z.preprocess((val) => val ? new Date(val) : undefined, z.date().optional())
});

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    // Check if this is a request for a specific listing
    if (query.id) {
      const listing = await CropListing.findById(query.id)
        .populate("farmer", "name email phone profile");

      if (!listing) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 });
      }

      return NextResponse.json({ listing });
    }

    // Otherwise, return list of listings
    const page = Number.parseInt(query.page || "1");
    const limit = Number.parseInt(query.limit || "12");
    const skip = (page - 1) * limit;

    const filter: any = {};
    filter.status = query.status || "available";
    
    if (query.grade) filter.grade = query.grade;
    if (query.category) filter.category = query.category;
    
    if (query.location) {
      filter.$or = [
        { "location.district": { $regex: query.location, $options: "i" } },
        { "location.state": { $regex: query.location, $options: "i" } },
      ];
    }

    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = Number.parseInt(query.minPrice);
      if (query.maxPrice) filter.price.$lte = Number.parseInt(query.maxPrice);
    }

    const listings = await CropListing.find(filter)
      .populate("farmer", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CropListing.countDocuments(filter);

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching crop listings:", error);
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

    const validatedData = cropListingSchema.parse(body);
    const listing = new CropListing(validatedData);
    await listing.save();
    await listing.populate("farmer", "name email phone");

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating crop listing:", error);
    
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
      error: "Failed to create listing",
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

    const existingListing = await CropListing.findById(id);
    
    if (!existingListing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (existingListing.farmer.toString() !== userId) {
      return NextResponse.json({ 
        error: "Unauthorized: You can only edit your own listings" 
      }, { status: 403 });
    }

    const updatedListing = await CropListing.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).populate("farmer", "name email phone");

    return NextResponse.json({ listing: updatedListing });
  } catch (error) {
    console.error("Error updating crop listing:", error);
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

    const listing = await CropListing.findById(id);
    
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.farmer.toString() !== userId) {
      return NextResponse.json({ 
        error: "Unauthorized: You can only delete your own listings" 
      }, { status: 403 });
    }

    await CropListing.findByIdAndDelete(id);
    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting crop listing:", error);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
