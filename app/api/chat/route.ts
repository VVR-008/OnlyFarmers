import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import User from "@/models/User";

// Verify JWT token and get user
async function verifyAuth(request: NextRequest) {
  try {
    // Try to get token from Authorization header first
    let token = request.headers.get("authorization")?.replace("Bearer ", "");
    
    // If no authorization header, try to get from cookies
    if (!token) {
      token = request.cookies.get("token")?.value;
    }
    
    if (!token) {
      return { isValid: false, error: "No authentication token provided" };
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (!decoded.userId) {
      return { isValid: false, error: "Invalid token format" };
    }

    // Connect to database and verify user exists
    await dbConnect();
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return { isValid: false, error: "User not found" };
    }

    return { 
      isValid: true, 
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  } catch (error: any) {
    console.error("Auth verification error:", error);
    return { isValid: false, error: "Invalid or expired token" };
  }
}

export async function POST(req: NextRequest) {
  try {
    // 🔒 Verify authentication first
    const authResult = await verifyAuth(req);
    
    if (!authResult.isValid) {
      return NextResponse.json({ 
        error: "Authentication required",
        details: authResult.error 
      }, { status: 401 });
    }

    console.log(`✅ Authenticated user: ${authResult.user?.name} (${authResult.user?.role})`);

    // Parse request body
    const body = await req.json();
    const { messages } = body as { messages: Array<{ role: string; content: string }> } | any;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ 
        error: "Invalid request",
        details: "Messages array is required" 
      }, { status: 400 });
    }

    if (messages.length === 0) {
      return NextResponse.json({ 
        error: "Invalid request",
        details: "At least one message is required" 
      }, { status: 400 });
    }

    // Validate Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY is not configured");
      return NextResponse.json({ 
        error: "Service unavailable",
        details: "AI service is not properly configured" 
      }, { status: 503 });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Use the correct model - check Gemini docs for latest model names
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro", // Updated to a more stable model
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // Add context about the user and platform
    const systemContext = `You are an AI assistant for OnlyFarmers, an agricultural marketplace platform. 
    You're helping ${authResult.user?.name} (${authResult.user?.role}) with questions related to farming, agriculture, crops, livestock, land, and the platform.
    
    Platform features include:
    - Crop listings and sales
    - Livestock trading
    - Land sales and rentals
    - Order management
    - Agricultural advice
    
    Please provide helpful, accurate information about agriculture and assist with platform-related questions. Keep responses concise and practical.`;

    // Transform messages for Gemini format
    const geminiMessages = [
      {
        role: "user",
        parts: [{ text: systemContext }],
      },
      ...messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }))
    ];

    console.log(`🤖 Processing chat request with ${messages.length} messages`);

    // Generate response from Gemini
    const result = await model.generateContent({
      contents: geminiMessages,
    });

    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    console.log(`✅ Generated response (${responseText.length} characters)`);

    // Log chat usage (optional - for analytics)
    console.log(`📊 Chat usage - User: ${authResult.user?.id}, Role: ${authResult.user?.role}, Messages: ${messages.length}`);

    return NextResponse.json({ 
      text: responseText,
      user: authResult.user?.name // Include user info in response
    });

  } catch (err: any) {
    console.error("❌ [GEMINI API ERROR]", err);
    
    // Handle specific Gemini API errors
    if (err.message?.includes("API_KEY")) {
      return NextResponse.json({ 
        error: "Service configuration error",
        details: "AI service is not properly configured" 
      }, { status: 503 });
    }
    
    if (err.message?.includes("quota") || err.message?.includes("limit")) {
      return NextResponse.json({ 
        error: "Service temporarily unavailable",
        details: "AI service is currently at capacity. Please try again later." 
      }, { status: 429 });
    }
    
    if (err.message?.includes("safety") || err.message?.includes("blocked")) {
      return NextResponse.json({ 
        error: "Content not allowed",
        details: "Your message contains content that cannot be processed. Please rephrase your question." 
      }, { status: 400 });
    }

    // Generic error response
    return NextResponse.json({ 
      error: "AI service error",
      details: "Failed to generate response. Please try again." 
    }, { status: 500 });
  }
}

// Optional: Add rate limiting for authenticated users
export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req);
  
  if (!authResult.isValid) {
    return NextResponse.json({ 
      error: "Authentication required" 
    }, { status: 401 });
  }

  return NextResponse.json({ 
    message: "Chat API is available",
    user: authResult.user?.name,
    status: "authenticated" 
  });
}
