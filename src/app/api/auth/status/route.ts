import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from 'config/db';
import User from '@src/models/user';

export async function POST(request: NextRequest) {
  await connectToDatabase(); // DB 연결

  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return NextResponse.json({ status: 401, message: 'Authorization header is missing' }, { status: 401 });
  }

  const token = authorization.split(' ')[1];

  if (!token) {
    return NextResponse.json({ status: 401, message: 'Token is missing' }, { status: 401 });
  }

  try {
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ status: 404, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: user._id,
        nickname: user.nickname,
        email: user.email,
        profile: {
          phone: user.profile.phone,
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ status: 401, message: 'Invalid or expired token' }, { status: 401 });
  }
}
