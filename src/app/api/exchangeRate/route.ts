import { NextRequest, NextResponse } from 'next/server';

const { EXCHANGE_API_KEY } = process.env;

export async function GET(req: NextRequest) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃 설정

  try {
    const response = await fetch(
      `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${EXCHANGE_API_KEY}&data=AP01`,
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching exchange rates:', error);

    // 특정 에러 코드가 발생할 경우, 재시도 로직 추가 가능
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Request timed out');
    }

    return NextResponse.json(
      { error: '환율 정보를 가져오는 데 실패했습니다.' },
      { status: 500 }
    );
  }
}