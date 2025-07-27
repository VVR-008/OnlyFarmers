import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as
      | { messages: Array<{ role: string; content: string }> }
      | undefined;

    if (!messages) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

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
  } catch (err: any) {
    // Optionally, send more error details in development
    console.error("[GEMINI API ERROR]", err);
    return NextResponse.json({ error: "Failed to connect to Gemini." }, { status: 500 });
  }
}
