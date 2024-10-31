import { NextResponse } from 'next/server';
import { Stock } from '@src/models/stock';


const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';

interface StockInfo {
  name: string;
  symbol: string;
  price: number;
  dividendPerShare: number;
  dividendYield: number;
  lastYearTotalDividend: string;
  currentYearTotalDividend: string;
  sector?: string;
  paymentMonths: string;
}

function getPaymentMonths(dividendData: any[]): string {
  if (!dividendData || dividendData.length === 0) return '정보 없음';

  // 최근 6개의 지급일 추출
  const recentPayments = dividendData
    .filter(item => item.payment_date !== 'None')
    .slice(0, 6)
    .map(item => new Date(item.payment_date).getMonth() + 1) // 1-12월로 변환
    .sort((a, b) => a - b); // 오름차순 정렬

  // 중복 제거
  const uniqueMonths = [...new Set(recentPayments)];

  if (uniqueMonths.length === 1) {
    // 연 1회 지급
    return `${uniqueMonths[0]}월`;
  } else if (uniqueMonths.length === 2) {
    // 반기 지급
    return `${uniqueMonths[0]}월, ${uniqueMonths[1]}월`;
  } else if (uniqueMonths.length === 4) {
    // 분기 지급
    return uniqueMonths.map(month => `${month}월`).join(', ');
  } else if (uniqueMonths.length >= 6) {
    // 매월 지급 (6개 이상의 서로 다른 월이 있으면 매월 지급으로 간주)
    return '매월';
  } else {
    // 그 외의 경우는 있는 그대로 표시
    return uniqueMonths.map(month => `${month}월`).join(', ');
  }
}

function getTotalDividendLastYear(dividendData: any[]): string {
  const lastYear = new Date().getFullYear() - 1;
  const lastYearPayments = dividendData.filter(item => {
    if (item.payment_date === 'None') return false;
    const paymentYear = new Date(item.payment_date).getFullYear();
    return paymentYear === lastYear;
  });

  const totalAmount = lastYearPayments.reduce((sum, item) => 
    sum + parseFloat(item.amount), 0
  );

  return `${totalAmount.toFixed(2)}(${lastYearPayments.length}회)`;
}

function getCurrentYearDividend(dividendData: any[]): string {
  const currentYear = new Date().getFullYear();
  const currentYearPayments = dividendData.filter(item => {
    if (item.payment_date === 'None') return false;
    const paymentYear = new Date(item.payment_date).getFullYear();
    return paymentYear === currentYear;
  });

  const totalAmount = currentYearPayments.reduce((sum, item) => 
    sum + parseFloat(item.amount), 0
  );

  return `${totalAmount.toFixed(2)}(${currentYearPayments.length}회)`;
}

async function fetchStockInfo(ticker: string): Promise<StockInfo> {
  // 주식 가격 정보 가져오기
  const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;
  const quoteResponse = await fetch(quoteUrl);
  const quoteData = await quoteResponse.json();
  const quotePrice = parseFloat(quoteData['Global Quote']['05. price']) || 0;

  if (quotePrice === 0) {
    throw new Error('유효하지 않은 티커입니다.');
  }

  // 회사 정보 가져오기
  const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;
  const overviewResponse = await fetch(overviewUrl);
  const overviewData = await overviewResponse.json();

  let stockInfo: StockInfo = {
    name: overviewData.Name || ticker,
    symbol: ticker,
    price: quotePrice,
    dividendPerShare: Number(overviewData.DividendPerShare) || 0,
    dividendYield: Number(overviewData.DividendYield) || 0,
    sector: overviewData.Sector || '',
    lastYearTotalDividend: '0.00(0)',
    currentYearTotalDividend: '0.00(0)',
    paymentMonths: '정보 없음'
  };

  // 회사 정보가 없는 경우 ETF 정보 조회 시도
  if (!overviewData.Name) {
    const etfUrl = `https://www.alphavantage.co/query?function=ETF_PROFILE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const etfResponse = await fetch(etfUrl);
    const etfData = await etfResponse.json();
    const dividendYield = Number(etfData.dividend_yield) || 0;
    stockInfo = {
      ...stockInfo,
      name: etfData.name || ticker,
      dividendPerShare: Number((quotePrice * dividendYield).toFixed(2)),
      dividendYield: dividendYield,
      sector: 'ETF'
    };
  }

  // 배당금/분배금 정보 가져오기
  const dividendUrl = `https://www.alphavantage.co/query?function=DIVIDENDS&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;
  const dividendResponse = await fetch(dividendUrl);
  const dividendData = await dividendResponse.json();

  if (dividendData.data) {
    stockInfo.lastYearTotalDividend = getTotalDividendLastYear(dividendData.data);
    stockInfo.currentYearTotalDividend = getCurrentYearDividend(dividendData.data);
    stockInfo.paymentMonths = getPaymentMonths(dividendData.data);
  }

  return stockInfo;
}

// GET 메서드 - 데이터 조회만 담당
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker')?.toUpperCase();

  if (!ticker) {
    return NextResponse.json({ error: '티커가 필요합니다.' }, { status: 400 });
  }

  try {
    // DB에서 조회
    const stockInfo = await Stock.findOne({ symbol: ticker });

    // DB에 데이터가 없는 경우
    if (!stockInfo) {
      return NextResponse.json({ error: '주식 정보가 존재하지 않습니다.' }, { status: 400 });
    }

    // 데이터가 있지만 오래된 경우 
    if (stockInfo.isStale()) {
      return NextResponse.json({ error: '최신 데이터가 필요합니다.' }, { status: 409 });
    }

    // 최신 데이터가 있는 경우
    return NextResponse.json({ ...stockInfo.toObject(), fromCache: true });
  } catch (error) {
    console.error('주식 정보 조회 중 오류 발생:', error);
    return NextResponse.json({ error: '주식 정보를 가져오는데 실패했습니다.' }, { status: 500 });
  }
}

// POST 메서드 - 새로운 주식 정보 생성 담당
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker')?.toUpperCase();

  if (!ticker) {
    return NextResponse.json({ error: '티커가 필요합니다.' }, { status: 400 });
  }

  try {
    // 이미 존재하는 주식인지 확인
    const existingStock = await Stock.findOne({ symbol: ticker });
    if (existingStock) {
      return NextResponse.json(
        { error: '이미 존재하는 주식입니다. PUT 메서드를 사용하세요.' }, 
        { status: 409 }
      );
    }

    const stockInfo = await fetchStockInfo(ticker);
    const newStock = await Stock.create({
      ...stockInfo,
      updatedAt: new Date()
    });

    return NextResponse.json(newStock, { status: 201 });
  } catch (error) {
    console.error('주식 정보 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '주식 정보 생성에 실패했습니다.' }, 
      { status: 500 }
    );
  }
}

// PUT 메서드 - 기존 주식 정보 업데이트 담당
export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker')?.toUpperCase();

  if (!ticker) {
    return NextResponse.json({ error: '티커가 필요합니다.' }, { status: 400 });
  }

  try {
    const stockInfo = await Stock.findOne({ symbol: ticker });
    if (!stockInfo) {
      return NextResponse.json(
        { error: '존재하지 않는 주식입니다. POST 메서드를 사용하세요.' }, 
        { status: 404 }
      );
    }

    const newStockInfo = await fetchStockInfo(ticker);
    Object.assign(stockInfo, newStockInfo, { updatedAt: new Date() });
    await stockInfo.save();

    return NextResponse.json(stockInfo);
  } catch (error) {
    console.error('주식 정보 업데이트 중 오류 발생:', error);
    return NextResponse.json(
      { error: '주식 정보 업데이트에 실패했습니다.' }, 
      { status: 500 }
    );
  }
}