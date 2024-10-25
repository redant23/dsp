import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from 'config/db';
import User from '@src/models/user';

export async function POST(request: NextRequest) {
  await connectToDatabase(); // DB 연결

  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return NextResponse.json({ status: 401, message: '인증 헤더가 누락되었습니다.' }, { status: 401 });
  }

  const token = authorization.split(' ')[1];

  if (!token) {
    return NextResponse.json({ status: 401, message: '토큰이 누락되었습니다.' }, { status: 401 });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET이 정의되지 않았습니다.');
    }
    
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ status: 404, message: '사용자를 찾을 수 없습니다.' }, { status: 404 });
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
    console.error('인증 오류:', error);
    return NextResponse.json({ status: 401, message: '유효하지 않거나 만료된 토큰입니다.' }, { status: 401 });
  }
}
