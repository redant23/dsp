import { NextRequest, NextResponse } from 'next/server';
import playwright from 'playwright-core';
import chromium from '@sparticuz/chromium';

export async function GET(req: NextRequest) {
  let browser;

  try {
    console.log('환율 정보 크롤링 시작...');
    chromium.setHeadlessMode = true;
    
    // Sparticuz/chromium 설정
    browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: (chromium.headless || true) as boolean,
    });

    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('https://www.kita.net/cmmrcInfo/ehgtGnrlzInfo/rltmEhgt.do', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    console.log('환율 정보 요소 대기 중...');
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
