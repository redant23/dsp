import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from 'config/db';
import User from '@src/models/user';

export async function POST(request: NextRequest) {

  await connectToDatabase();
  
  const { email, password, nickname, phone } = await request.json();

  try {

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      nickname,
      email,
      passwordHash,
      profile: {
        phone: phone,
      },
    });
    await User.create(newUser);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('회원가입 오류:', error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
};