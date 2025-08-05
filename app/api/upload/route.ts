import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Detect MIME type from file
    const mimeType = file.type || 'image/jpeg';

    // Convert to Base64 string with proper data URL format
    const base64String = `data:${mimeType};base64,${buffer.toString("base64")}`;

    // Return the base64 data URL
    return NextResponse.json({ 
      url: base64String,
      mimeType: mimeType,
      size: buffer.length 
    }, { status: 200 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
