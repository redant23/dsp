import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from 'config/db';
import User from '@src/models/user';

let serverTimeDiff = 0; // 서버와의 시간 차이를 저장할 변수

// 서버 시간을 가져오고 시간 차이를 계산하는 함수
async function syncTime() {
  try {
    const response = await fetch('/api/server-time');
    if (!response.ok) {
      throw new Error('서버 시간을 가져오는데 실패했습니다.');
    }
    const serverTime = await response.json();
    serverTimeDiff = serverTime - Date.now();
  } catch (error) {
    console.error('시간 동기화 오류:', error);
    // 오류 발생 시 기본값으로 설정
    serverTimeDiff = 0;
  }
}

// JWT 검증 시 사용할 조정된 현재 시간을 반환하는 함수
function getAdjustedTime() {
  return Date.now() + serverTimeDiff;
}

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

    // 서버 시간과 클라이언트 시간 동기화
    await syncTime();
    
    // 조정된 시간을 사용하여 JWT 검증
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET, {
      clockTimestamp: Math.floor(getAdjustedTime() / 1000)
    });

    // 조정된 시간을 사용하여 토큰 만료 여부 확인
    if (decoded.exp < getAdjustedTime() / 1000) {
      throw new Error('토큰이 만료되었습니다.');
    }

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
      },
      serverTime: new Date(getAdjustedTime()).toISOString(),
    });
  } catch (error) {
    console.error('인증 오류:', error);
    return NextResponse.json({ status: 401, message: '유효하지 않거나 만료된 토큰입니다.' }, { status: 401 });
  }
}
