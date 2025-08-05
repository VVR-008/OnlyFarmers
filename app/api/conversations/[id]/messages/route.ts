import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";

// Get messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    const conversationId = params.id;

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Get messages
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 })
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        read: false
      },
      { read: true }
    );

    // Update unread count
    conversation.unreadCount.set(userId, 0);
    await conversation.save();

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    const conversationId = params.id;
    const body = await request.json();
    const { content, messageType = 'text' } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Create message
    const message = new Message({
      conversationId,
      sender: userId,
      content: content.trim(),
      messageType
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = {
      content: content.trim(),
      sender: userId,
      createdAt: new Date()
    };

    // Increment unread count for other participants
    conversation.participants.forEach((participantId: any) => {
      if (participantId.toString() !== userId) {
        const currentCount = conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(participantId.toString(), currentCount + 1);
      }
    });

    await conversation.save();

    // Return the message with sender info
    const messageWithSender = await Message.findById(message._id)
      .populate('sender', 'name email role')
      .lean();

    return NextResponse.json({ 
      message: messageWithSender,
      success: true
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
} 