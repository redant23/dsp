
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { IUserStock, UserStock } from '@src/models/userStock';
import { connectToDatabase } from 'lib/mongodb';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    await connectToDatabase();
    
    const userStocks = await request.json();

    // 기존 포트폴리오 삭제
    await UserStock.deleteMany({ user: session.user.id });

    // 새로운 포트폴리오 추가
    const updatedUserStocks = await UserStock.insertMany(
      userStocks.map((userStock: any) => {
        const updatedUserStock = {
          user: userStock.user,
          stock: userStock.stock,
          status: userStock.status,
          quantity: userStock.quantity
        } as IUserStock;

        if (userStock.status === '보유중') {
          updatedUserStock.purchaseDate = userStock.purchaseDate;
        }

        if (userStock.status === '매도') {
          updatedUserStock.sellDate = userStock.purchaseDate;
        }

        updatedUserStock.updatedAt = new Date();

        return updatedUserStock;
      })
    );


    return NextResponse.json(updatedUserStocks);

  } catch (error) {
    console.error('포트폴리오 업데이트 중 오류 발생:', error);
    return NextResponse.json({ error: '포트폴리오 업데이트에 실패했습니다.' }, { status: 500 });
  }
}
