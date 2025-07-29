import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import CropListing from "@/models/CropListings";
import LivestockListing from "@/models/LivestockListings";
import LandListing from "@/models/LandListings";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = request.nextUrl;
    await dbConnect();
    
    const order = await Order.findById(params.id)
      .populate("buyer", "name email phone")
      .populate("seller", "name email phone")
      .populate("listing");
    
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const userId = request.headers.get("x-user-id");
    const body = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    const order = await Order.findById(params.id).populate("listing");
    
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    // Only seller can update order status
    if (order.seller.toString() !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    const { status } = body;
    
    // ✅ NEW: Handle quantity management when accepting orders
    if (status === "accepted" && order.status === "pending") {
      const listing = order.listing;
      
      if (!listing) {
        return NextResponse.json({ error: "Associated listing not found" }, { status: 400 });
      }
      
      // Check if listing is still available
      if (listing.status !== "available") {
        return NextResponse.json({ 
          error: "Listing is no longer available" 
        }, { status: 400 });
      }
      
      // Update quantity based on listing type
      let updatedListing;
      
      if (order.listingType === "crop") {
        const cropListing = await CropListing.findById(listing._id);
        if (!cropListing) {
          return NextResponse.json({ error: "Crop listing not found" }, { status: 400 });
        }
        
        // Check if enough quantity is available
        if (cropListing.quantity.value < (order.quantity || 0)) {
          return NextResponse.json({ 
            error: `Insufficient quantity. Available: ${cropListing.quantity.value} ${cropListing.quantity.unit}` 
          }, { status: 400 });
        }
        
        // Deduct quantity
        const newQuantity = cropListing.quantity.value - (order.quantity || 0);
        
        updatedListing = await CropListing.findByIdAndUpdate(
          listing._id,
          {
            $set: {
              "quantity.value": newQuantity,
              // Mark as sold if quantity reaches zero
              status: newQuantity <= 0 ? "sold" : "available"
            }
          },
          { new: true }
        );
        
        console.log(`✅ Updated crop quantity: ${cropListing.quantity.value} -> ${newQuantity}`);
        
      } else if (order.listingType === "livestock") {
        const livestockListing = await LivestockListing.findById(listing._id);
        if (!livestockListing) {
          return NextResponse.json({ error: "Livestock listing not found" }, { status: 400 });
        }
        
        // Check if enough quantity is available
        if (livestockListing.quantity < (order.quantity || 0)) {
          return NextResponse.json({ 
            error: `Insufficient quantity. Available: ${livestockListing.quantity} animals` 
          }, { status: 400 });
        }
        
        // Deduct quantity
        const newQuantity = livestockListing.quantity - (order.quantity || 0);
        
        updatedListing = await LivestockListing.findByIdAndUpdate(
          listing._id,
          {
            quantity: newQuantity,
            // Mark as sold if quantity reaches zero
            status: newQuantity <= 0 ? "sold" : "available"
          },
          { new: true }
        );
        
        console.log(`✅ Updated livestock quantity: ${livestockListing.quantity} -> ${newQuantity}`);
        
      } else if (order.listingType === "land") {
        // For land, simply mark as sold since it's typically one unit
        updatedListing = await LandListing.findByIdAndUpdate(
          listing._id,
          { status: "sold" },
          { new: true }
        );
        
        console.log(`✅ Marked land listing as sold`);
      }
      
      if (!updatedListing) {
        return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
      }
    }
    
    // ✅ NEW: Handle quantity restoration when rejecting/cancelling accepted orders
    if ((status === "rejected" || status === "cancelled") && order.status === "accepted") {
      const listing = order.listing;
      
      if (listing && order.quantity) {
        if (order.listingType === "crop") {
          await CropListing.findByIdAndUpdate(
            listing._id,
            {
              $inc: { "quantity.value": order.quantity },
              status: "available" // Restore to available
            }
          );
          console.log(`✅ Restored crop quantity: +${order.quantity}`);
          
        } else if (order.listingType === "livestock") {
          await LivestockListing.findByIdAndUpdate(
            listing._id,
            {
              $inc: { quantity: order.quantity },
              status: "available" // Restore to available
            }
          );
          console.log(`✅ Restored livestock quantity: +${order.quantity}`);
          
        } else if (order.listingType === "land") {
          await LandListing.findByIdAndUpdate(
            listing._id,
            { status: "available" } // Restore to available
          );
          console.log(`✅ Restored land listing to available`);
        }
      }
    }
    
    // Update order with timestamp
    const updateData: any = { status };
    if (status === "accepted" || status === "rejected") {
      updateData.respondedAt = new Date();
    }
    if (status === "completed") {
      updateData.completedAt = new Date();
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate([
      { path: "buyer", select: "name email phone" },
      { path: "seller", select: "name email phone" },
      { path: "listing" },
    ]);
    
    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
