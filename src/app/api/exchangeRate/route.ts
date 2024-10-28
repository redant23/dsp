import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  let browser;

  try {
    console.log('환율 정보 크롤링 시작...');
    
    // 동적 임포트로 변경
    const puppeteer = (await import('puppeteer-extra')).default;
    const StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;
    
    puppeteer.use(StealthPlugin());
    
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    console.log('새 페이지 생성 중...');
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    
    console.log('KITA 환율 페이지로 이동 중...');
        
    await page.setRequestInterception(true);
    
    page.on('request', (request: any) => {
      console.log(`요청 URL: ${request.url()}`);
      request.continue();
    });

    page.on('load', () => {
      console.log('페이지 로드 완료 (모든 리소스)');
    });

    page.on('networkidle0', () => {
      console.log('네트워크 요청 없음 (500ms)');
    });
    
    // 페이지 로드 전에 JavaScript 활성화 확인
    await page.setJavaScriptEnabled(true);
    
    await page.goto('https://www.kita.net/cmmrcInfo/ehgtGnrlzInfo/rltmEhgt.do', {
      waitUntil: ['domcontentloaded'],
      timeout: 120000, // Lambda 제한시간 고려하여 90초로 설정
    });
    
    // 페이지 로드 후 상태 확인
    const pageTitle = await page.title();
    console.log('페이지 타이틀:', pageTitle);

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
