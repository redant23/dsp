import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from 'lib/mongodb';
import User from '@src/models/user';

export async function POST(request: NextRequest) {
  try {
    const { email, password, nickname, phone } = await request.json();
    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "이미 등록된 이메일입니다" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      nickname,
      email,
      profile: {
        phone,
      },
      passwordHash: hashedPassword,
    });

    return NextResponse.json(
      { 
        message: "회원가입이 완료되었습니다",
        success: true
       },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "회원가입 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}