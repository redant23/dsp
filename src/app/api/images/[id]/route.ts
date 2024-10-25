
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from 'config/db';
import Image from '@src/models/image';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');

  await connectToDatabase();

  try {
    const image = await Image.findById(id);
    if (!image) {
      return NextResponse.json({ status: 404, message: 'Image not found' }, { status: 404 });
    }
    return NextResponse.json({ status: 200, url: image.url });
  } catch (error) {
    return NextResponse.json({ status: 500, message: 'Server error' }, { status: 500 });
  }
}
