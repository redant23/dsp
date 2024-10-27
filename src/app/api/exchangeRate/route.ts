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
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      });
    }

    console.log('새 페이지 생성 중...');
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    
    console.log('KITA 환율 페이지로 이동 중...');
    await page.goto('https://www.kita.net/cmmrcInfo/ehgtGnrlzInfo/rltmEhgt.do', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    console.log('환율 정보 요소 대기 중...');
    await page.waitForSelector('.table-wrap-outline tbody tr:first-child', { timeout: 15000 });

    console.log('환율 정보 추출 중...');
    const exchangeRateData = await page.evaluate(() => {
      const firstRow = document.querySelector('.table-wrap-outline tbody tr:first-child');
      if (!firstRow) return null;

      const tds = firstRow.querySelectorAll('td');
      if (tds.length < 5) return null;

      return {
        buy: tds[3].textContent?.trim(),
        sell: tds[4].textContent?.trim()
      };
    });

    if (exchangeRateData && exchangeRateData.buy && exchangeRateData.sell) {
      console.log('환율 정보 추출 성공:', exchangeRateData);
      return NextResponse.json(exchangeRateData);
    } else {
      console.error('환율 데이터 파싱 실패');
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
