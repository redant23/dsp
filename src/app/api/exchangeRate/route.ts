import { NextRequest, NextResponse } from 'next/server';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer';

export async function GET(req: NextRequest) {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: process.env.NODE_ENV === 'production' ? await chromium.executablePath : puppeteer.executablePath(),
      headless: true,
      timeout: 60000, // 1분
    });

    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    await page.goto('https://obank.kbstar.com/quics?page=C101425', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForSelector('#b101921', { timeout: 15000 });
    const exchangeRateText = await page.$eval('#b101921', (el) => (el as HTMLElement).innerText);

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
    if (browser !== null) {
      await browser.close();
    }
  }
}