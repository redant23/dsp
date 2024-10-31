import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      email: string;
      nickname: string;
      phone: string;
    }
  }

  interface User {
    id: string;
    email: string;
    nickname: string;
    phone: string;
  }
}

export interface User {
  id?: string;
  nickname: string;
  email: string;
  phone: string;
}

export interface ExchangeRate {
  buy: number;
  sell: number;
}

export interface StockPortfolioListProps {
  exchangeRate: ExchangeRate;
}

// RequestInit 인터페이스 확장
declare global {
  interface RequestInit {
    agent?: any;
  }
}