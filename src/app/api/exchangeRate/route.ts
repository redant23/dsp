import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { Browser } from 'puppeteer-core';

export async function GET(req: NextRequest) {
  let browser: Browser | null = null;

  try {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      browser = await puppeteer.launch({
        headless: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // 로컬 Chrome 실행 파일 경로 지정
      });
    }

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    await page.goto('https://obank.kbstar.com/quics?page=C101425', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForSelector('#b101921', { timeout: 15000 });
    const element = await page.$('#b101921');

    if (!element) {
      throw new Error("요소를 찾을 수 없습니다");
    }

    const exchangeRateText = await page.evaluate((el) => (el as HTMLElement).innerText, element);

    // 정규식으로 환율 정보 파싱
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
    console.error('환율 정보 가져오기 실패:', error);
    return NextResponse.json({ error: '환율 정보를 가져오는데 실패했습니다.' }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
