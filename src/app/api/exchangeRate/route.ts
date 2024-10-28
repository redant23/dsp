import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

export async function GET(req: NextRequest) {
  

  try {
    const response = await fetch('https://www.kita.net/cmmrcInfo/ehgtGnrlzInfo/rltmEhgt.do');
    const html = await response.text();
    // HTML 문자열을 파싱하여 DOM 객체로 변환
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // 테이블에서 첫 번째 행의 데이터 추출
    const firstRow = doc.querySelector('.table-wrap-outline tbody tr:first-child');
    if (!firstRow) {
      throw new Error('환율 데이터를 찾을 수 없습니다.');
    }

    const tds = firstRow.querySelectorAll('td');
    if (tds.length < 5) {
      throw new Error('환율 데이터 형식이 올바르지 않습니다.');
    }

    const exchangeRateData = {
      buy: tds[3].textContent?.trim(),
      sell: tds[4].textContent?.trim()
    };

    if (!exchangeRateData.buy || !exchangeRateData.sell) {
      throw new Error('매수/매도 환율을 추출할 수 없습니다.');
    }

    return NextResponse.json(exchangeRateData);
    
    
  } catch (error) {
    console.error('환율 정보 가져오기 실패:', error);
    return NextResponse.json({ error: '환율 정보를 가져오는데 실패했습니다.' }, { status: 500 });
  } 
}
