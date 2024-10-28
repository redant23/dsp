import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function GET(req: NextRequest) {
  let browser;

  try {
    console.log('환율 정보 크롤링 시작...');
    
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
      // AWS Lambda 환경을 위한 추가 설정
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    
    // 네트워크 요청 모니터링
    page.on('request', request => {
      console.log(`요청 URL: ${request.url()}`);
    });

    await page.goto('https://www.kita.net/cmmrcInfo/ehgtGnrlzInfo/rltmEhgt.do', {
      waitUntil: 'domcontentloaded',
      timeout: 120000
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
