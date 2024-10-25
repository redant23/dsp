import { NextRequest, NextResponse } from 'next/server';

const { EXCHANGE_API_KEY } = process.env;

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(`https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${EXCHANGE_API_KEY}&data=AP01`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '환율 정보를 가져오는 데 실패했습니다.' }, { status: 500 });
  }
}
