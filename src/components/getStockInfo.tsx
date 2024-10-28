import yahooFinance from 'yahoo-finance2';

interface StockInfo {
  longName: string;
  symbol: string;
  regularMarketPrice: number | undefined;
  trailingAnnualDividendRate: number | undefined;
  sector?: string | undefined;
}

export async function getStockInfo(ticker: string): Promise<StockInfo | null> {
  try {
    console.log('ticker', ticker);
    const result = await yahooFinance.quote(ticker);

    const sectorData = await yahooFinance.insights(ticker);
    const sector = sectorData.companySnapshot?.sectorInfo;

    return {
      longName: result.longName || '',
      symbol: result.symbol,
      regularMarketPrice: result.regularMarketPrice,
      trailingAnnualDividendRate: result.trailingAnnualDividendRate || undefined,
      sector
    };
    
  } catch (error) {
    console.error('주식 정보를 가져오는 중 오류가 발생했습니다:', error);
    return null;
  }
}

