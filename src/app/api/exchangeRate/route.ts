
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET(req: NextRequest) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  try {
    // KB국민은행 환율 페이지로 이동
    await page.goto('https://obank.kbstar.com/quics?page=C101425', {
      waitUntil: 'domcontentloaded',
      timeout: 30000, // 30초
    });
    
    // div#b101921 요소가 로드될 때까지 기다림
    await page.waitForSelector('#b101921');

    // 해당 요소의 텍스트 추출
    const exchangeRateText = await page.$eval('#b101921', (el) => (el as HTMLElement).innerText);
    
    // 필요 값 추출: "사실때"와 "파실때"에 해당하는 첫 번째 값만 추출
    const regex = /(\d{1,3}(?:,\d{3})*\.\d{2})\s+(\d{1,3}(?:,\d{3})*\.\d{2})/;
    const matches = exchangeRateText.match(regex);

    if (matches && matches.length >= 3) {
      const buy = matches[1];
      const sell = matches[2];
      return NextResponse.json({ buy, sell });
    } else {
      return NextResponse.json({ error: '환율 데이터를 파싱할 수 없습니다.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return NextResponse.json({ error: 'Failed to fetch exchange rate' }, { status: 500 });
  } finally {
    await browser.close();
  }
}