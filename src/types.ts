export interface User {
  id: string;
  nickname: string;
  email: string;
  profile: {
    phone: string;
  }
}

export interface ExchangeRate {
  cur_unit: string;
  ttb: string;
  tts: string;
  deal_bas_r: string;
}

export interface StockPortfolioListProps {
  exchangeRates: ExchangeRate[];
}