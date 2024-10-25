export interface User {
  id: string;
  nickname: string;
  email: string;
  profile: {
    phone: string;
  }
}

export interface ExchangeRate {
  buy: number;
  sell: number;
}

export interface StockPortfolioListProps {
  exchangeRate: ExchangeRate;
}