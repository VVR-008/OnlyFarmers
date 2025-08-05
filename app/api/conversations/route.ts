import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";
import CropListings from "@/models/CropListings";
import LivestockListings from "@/models/LivestockListings";
import LandListings from "@/models/LandListings";

// Get conversations for a user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const userId = request.headers.get("x-user-id");
    console.log("Received user ID:", userId);
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    // Get conversations where user is a participant
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'name email role')
    .sort({ updatedAt: -1 })
    .lean();

    console.log("Found conversations:", conversations.length);

    // Get unread message counts and populate listing details for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          sender: { $ne: userId },
          read: false
        });

        // Populate listing details based on listingType
        let listingDetails = null;
        if (conv.listingId && conv.listingType) {
          try {
            let ListingModel;
            switch (conv.listingType) {
              case 'crop':
                ListingModel = CropListings;
                break;
              case 'livestock':
                ListingModel = LivestockListings;
                break;
              case 'land':
                ListingModel = LandListings;
                break;
              default:
                ListingModel = null;
            }
            
            if (ListingModel) {
              const listing = await ListingModel.findById(conv.listingId)
                .select('title images')
                .lean();
              listingDetails = listing;
            }
          } catch (error) {
            console.error("Error populating listing:", error);
          }
        }

        return {
          ...conv,
          unreadCount,
          listingId: listingDetails
        };
      })
    );

    return NextResponse.json({ conversations: conversationsWithUnread });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

// Create a new conversation
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    const body = await request.json();
    const { otherUserId, listingId, listingType, initialMessage } = body;

    if (!otherUserId) {
      return NextResponse.json({ error: "Other user ID required" }, { status: 400 });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
      listingId: listingId || null
    });

    if (existingConversation) {
      return NextResponse.json({ 
        conversationId: existingConversation._id,
        message: "Conversation already exists"
      });
    }

    // Create new conversation
    const conversation = new Conversation({
      participants: [userId, otherUserId],
      listingId,
      listingType,
      unreadCount: {
        [otherUserId]: 0
      }
    });

    await conversation.save();

    // If there's an initial message, create it
    if (initialMessage) {
      const message = new Message({
        conversationId: conversation._id,
        sender: userId,
        content: initialMessage,
        messageType: 'text'
      });

      await message.save();

      // Update conversation with last message
      conversation.lastMessage = {
        content: initialMessage,
        sender: userId,
        createdAt: new Date()
      };
      conversation.unreadCount.set(otherUserId, 1);
      await conversation.save();
    }

    return NextResponse.json({ 
      conversationId: conversation._id,
      message: "Conversation created successfully"
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
} 