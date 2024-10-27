import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { Browser } from 'puppeteer-core';

export async function GET(req: NextRequest) {
  let browser: Browser | null = null;

  try {
    console.log('환율 정보 크롤링 시작...');
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      console.log('프로덕션 환경에서 브라우저 실행 중...');
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      console.log('개발 환경에서 로컬 Chrome 실행 중...');
      browser = await puppeteer.launch({
        headless: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // 로컬 Chrome 실행 파일 경로 지정
      });
    }

    console.log('새 페이지 생성 중...');
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    
    console.log('KB 환율 페이지로 이동 중...');
    await page.goto('https://obank.kbstar.com/quics?page=C101335', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    console.log('환율 정보 요소 대기 중...');
    await page.waitForSelector('#b101921', { timeout: 15000 });
    const element = await page.$('#b101921');

    if (!element) {
      console.error('환율 정보 요소를 찾을 수 없습니다.');
      throw new Error("요소를 찾을 수 없습니다");
    }

    console.log('환율 정보 추출 중...');
    const exchangeRateText = await page.evaluate((el) => (el as HTMLElement).innerText, element);

    // 정규식으로 환율 정보 파싱
    const regex = /(\d{1,3}(?:,\d{3})*\.\d{2})\s+(\d{1,3}(?:,\d{3})*\.\d{2})/;
    const matches = exchangeRateText.match(regex);

    if (matches && matches.length >= 3) {
      const buy = matches[1];
      const sell = matches[2];
      console.log('환율 정보 추출 성공:', { buy, sell });
      return NextResponse.json({ buy, sell });
    } else {
      console.error('환율 데이터 파싱 실패:', exchangeRateText);
      return NextResponse.json({ error: '환율 데이터를 파싱할 수 없습니다.' }, { status: 500 });
    }
  } catch (error) {
    console.error('환율 정보 가져오기 실패:', error);
    return NextResponse.json({ error: '환율 정보를 가져오는데 실패했습니다.' }, { status: 500 });
  } finally {
    if (browser) {
      console.log('브라우저 종료 중...');
      await browser.close();
    }
  }
}
