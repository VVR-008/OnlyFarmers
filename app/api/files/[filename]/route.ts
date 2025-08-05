// app/api/files/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

export async function GET(req: NextRequest, { params }) {
  const { filename } = params;
  const filePath = join(process.cwd(), 'uploads', filename);
  if (!existsSync(filePath)) {
    return new NextResponse('Not found', { status: 404 });
  }

  // TODO: implement permissions/auth checks here.

  // Return stream
  const stream = createReadStream(filePath);
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/octet-stream'
    }
  });
}
        