import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { IUserStock, UserStock } from '@src/models/userStock';
import { Stock } from '@src/models/stock';
import { connectToDatabase } from 'lib/mongodb';
import { authOptions } from 'lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    await connectToDatabase();

    // 사용자의 포트폴리오 가져오기
    const userStocks = await UserStock.find({ user: session.user.id })
      .populate({
        path: 'stock',
        model: Stock
      });

    const portfolio = userStocks.map(userStock => ({
      _id: userStock._id,
      user: userStock.user,
      stock: userStock.stock,
      status: userStock.status,
      purchaseDate: userStock.purchaseDate || null,
      sellDate: userStock.sellDate || null,
      quantity: userStock.quantity,
      category: userStock.stock.sector || '미분류',
      name: userStock.stock.name,
      ticker: userStock.stock.symbol,
      priceUSD: userStock.stock.price,
      dividendUSD: userStock.stock.dividendPerShare,
      dividendYield: userStock.stock.dividendYield,
      lastYearTotalDividend: userStock.stock.lastYearTotalDividend,
      currentYearTotalDividend: userStock.stock.currentYearTotalDividend,
      paymentMonth: userStock.stock.paymentMonths
    }));
    
    // portfolio 배열의 각 객체에서 null인 날짜 필드 제거
    // 클라이언트에서 undefined 필드는 자동으로 제외되어 전송되므로 안전함
    // StockPortfolioList 컴포넌트에서도 optional chaining으로 처리하고 있어 문제없음
    portfolio.forEach(stock => {
      if (!stock.purchaseDate) delete stock.purchaseDate;
      if (!stock.sellDate) delete stock.sellDate;
    });

    return NextResponse.json(portfolio);

  } catch (error) {
    console.error('포트폴리오 조회 중 오류 발생:', error);
    return NextResponse.json({ error: '포트폴리오를 가져오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    await connectToDatabase();
    
    const data = await request.json();
    const { stock, user, status, purchaseDate, quantity } = data;

    const userStock = {
      user,
      stock,
      status,
      quantity
    } as IUserStock;

    if (status === '보유중') {
      userStock.purchaseDate = purchaseDate;
    }

    if (status === '매도') {
      userStock.sellDate = purchaseDate;
    }

    const newUserStock = await UserStock.create(userStock);

    const populatedUserStock = await UserStock.findById(newUserStock._id)
      .populate({
        path: 'stock',
        model: Stock
      });

    const portFolioFormat = {
      _id: populatedUserStock._id,
      user: populatedUserStock.user,
      ticker: populatedUserStock.stock.symbol,
      stock: populatedUserStock.stock,
      status: populatedUserStock.status,
      quantity: populatedUserStock.quantity,
      priceUSD: populatedUserStock.stock.price,
      paymentMonth: populatedUserStock.stock.paymentMonths,
      name: populatedUserStock.stock.name,
      category: populatedUserStock.stock.sector,
      dividendUSD: populatedUserStock.stock.dividendPerShare,
      dividendYield: populatedUserStock.stock.dividendYield,
      lastYearTotalDividend: populatedUserStock.stock.lastYearTotalDividend,
      currentYearTotalDividend: populatedUserStock.stock.currentYearTotalDividend,
    }
    return NextResponse.json(portFolioFormat);

  } catch (error) {
    console.error('포트폴리오 추가 중 오류 발생:', error);
    return NextResponse.json({ error: '포트폴리오 추가에 실패했습니다.' }, { status: 500 });
  }
}

