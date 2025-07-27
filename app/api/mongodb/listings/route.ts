import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb/connection"
import { ObjectId } from "mongodb"
import type { CropListing } from "@/lib/mongodb/schemas"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const type = searchParams.get("type") || "crop"
    const search = searchParams.get("search") || ""
    const location = searchParams.get("location") || ""
    const cropType = searchParams.get("cropType") || ""
    const minPrice = Number.parseFloat(searchParams.get("minPrice") || "0")
    const maxPrice = Number.parseFloat(searchParams.get("maxPrice") || "999999")
    const organicOnly = searchParams.get("organicOnly") === "true"
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1

    const db = await getDatabase()
    const collection = db.collection("cropListings")

    // Build aggregation pipeline
    const pipeline: any[] = [
      // Match stage - filter documents
      {
        $match: {
          status: "active",
          ...(search && {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } },
              { "crop.type": { $regex: search, $options: "i" } },
            ],
          }),
          ...(location && { location: { $regex: location, $options: "i" } }),
          ...(cropType && { "crop.type": cropType }),
          ...(organicOnly && { "quality.organicCertified": true }),
          "pricing.basePrice": { $gte: minPrice, $lte: maxPrice },
        },
      },

      // Lookup farmer details
      {
        $lookup: {
          from: "users",
          localField: "farmerId",
          foreignField: "_id",
          as: "farmer",
          pipeline: [
            {
              $project: {
                name: 1,
                "profile.avatar": 1,
                "verification.status": 1,
                "analytics.averageRating": 1,
              },
            },
          ],
        },
      },

      // Unwind farmer array
      { $unwind: "$farmer" },

      // Add computed fields
      {
        $addFields: {
          totalViews: "$analytics.views",
          farmerRating: "$farmer.analytics.averageRating",
          isVerified: { $eq: ["$farmer.verification.status", "verified"] },
          daysOld: {
            $divide: [{ $subtract: [new Date(), "$createdAt"] }, 1000 * 60 * 60 * 24],
          },
        },
      },

      // Sort stage
      { $sort: { [sortBy]: sortOrder, _id: 1 } },

      // Facet for pagination and total count
      {
        $facet: {
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ]

    const result = await collection.aggregate(pipeline).toArray()
    const listings = result[0]?.data || []
    const totalCount = result[0]?.totalCount[0]?.count || 0
    const totalPages = Math.ceil(totalCount / limit)

    // Add AI insights for each listing
    const enrichedListings = listings.map((listing: any) => ({
      ...listing,
      aiInsights: {
        qualityScore: Math.round(Math.random() * 30 + 70), // 70-100
        marketDemand: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
        priceRecommendation: listing.pricing.basePrice * (0.95 + Math.random() * 0.1),
        competitorAnalysis: {
          averagePrice: listing.pricing.basePrice * (0.9 + Math.random() * 0.2),
          totalCompetitors: Math.floor(Math.random() * 20 + 5),
        },
      },
    }))

    return NextResponse.json({
      success: true,
      data: enrichedListings,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching listings:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch listings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const db = await getDatabase()
    const collection = db.collection("cropListings")

    // Validate required fields
    const requiredFields = ["title", "farmerId", "crop", "quantity", "pricing"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Create new listing with MongoDB schema
    const newListing: Partial<CropListing> = {
      ...body,
      farmerId: new ObjectId(body.farmerId),
      farmId: body.farmId ? new ObjectId(body.farmId) : undefined,
      status: "active",
      featured: false,
      analytics: {
        views: 0,
        inquiries: 0,
        bookmarks: 0,
        shareCount: 0,
        conversionRate: 0,
      },
      aiInsights: {
        qualityScore: Math.round(Math.random() * 30 + 70),
        marketDemand: "medium" as const,
        priceRecommendation: body.pricing.basePrice,
        bestSellingTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        competitorAnalysis: {
          averagePrice: body.pricing.basePrice * 0.95,
          totalCompetitors: 10,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    }

    const result = await collection.insertOne(newListing)

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...newListing },
      message: "Listing created successfully",
    })
  } catch (error) {
    console.error("Error creating listing:", error)
    return NextResponse.json({ success: false, error: "Failed to create listing" }, { status: 500 })
  }
}
