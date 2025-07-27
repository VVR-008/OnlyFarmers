import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/mongodb/connection"
import { simpleCache } from "@/lib/cache/simple-cache"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const type = searchParams.get("type") || "crop"
    const search = searchParams.get("search") || ""
    const location = searchParams.get("location") || ""

    // Check cache first
    const cacheKey = `listings:${type}:${page}:${limit}:${search}:${location}`
    const cachedData = simpleCache.get(cacheKey)

    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    // Simulate database query
    const result = await db.query("cropListings", "find", {
      type,
      search,
      location,
      page,
      limit,
    })

    const response = {
      success: true,
      data: result.data,
      pagination: {
        page,
        limit,
        totalCount: result.data?.length || 0,
        totalPages: Math.ceil((result.data?.length || 0) / limit),
        hasNext: page < Math.ceil((result.data?.length || 0) / limit),
        hasPrev: page > 1,
      },
    }

    // Cache the result for 10 minutes
    simpleCache.set(cacheKey, response, 600)

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching listings:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch listings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["title", "farmerId", "crop", "quantity", "pricing"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Simulate database insertion
    const result = await db.query("cropListings", "insert", {
      ...body,
      status: "active",
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Clear related cache entries
    simpleCache.delete("listings:crop:1:12::")

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...body },
      message: "Listing created successfully",
    })
  } catch (error) {
    console.error("Error creating listing:", error)
    return NextResponse.json({ success: false, error: "Failed to create listing" }, { status: 500 })
  }
}
