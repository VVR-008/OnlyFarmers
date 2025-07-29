import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const messagesParam = searchParams.get("messages");

    if (!messagesParam) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const messages = JSON.parse(messagesParam) as Array<{ role: string; content: string }>;

    // IMPORTANT: Use the latest Gemini model!
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    // Update model ID to a supported one (see docs, e.g. "gemini-1.5-pro-latest")
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // Transform chats for Gemini
    const userPrompts = messages.map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const result = await model.generateContent({
      contents: userPrompts,
    });

    const responseText = result.response.text();

    return NextResponse.json({ text: responseText });
  } catch (error) {
    console.error("Error in Gemini POST:", error);
    return NextResponse.json({ success: false, error: "Failed to process Gemini request" }, { status: 500 });
  }
}
