import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from 'lib/mongodb';
import User from '@src/models/user';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { email } = await request.json();
    
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json({ status: 400, message: '이미 사용 중인 이메일입니다.' }, { status: 400 });
    }
    return NextResponse.json({ status: 200, message: '사용 가능한 이메일입니다.' }, { status: 200 });
  } catch (error) {
    console.error('이메일 중복 체크 오류:', error);
    return NextResponse.json({ status: 500, message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}