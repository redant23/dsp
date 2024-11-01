import 'next-auth';
import mongoose from 'mongoose';
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

export type PortfolioStock = {
  _id?: string; // userStock id
  user: mongoose.Types.ObjectId | object | string; // user Object id 혹은 user Object
  stock: mongoose.Types.ObjectId | object | string; // stock Object id 혹은 stock Object
  status: string;
  purchaseDate?: Date;
  sellDate?: Date;
  category: string;
  name: string;
  ticker: string;
  priceUSD: number;
  dividendUSD: number;
  priceKRW: number;
  dividendYield: number;
  quantity: number;
  totalCostKRW: number;
  totalDividend: number;
  lastYearTotalDividend: string;
  currentYearTotalDividend: string;
  paymentMonth: string;
};

export interface StockPortfolioListProps {
  exchangeRate: ExchangeRate;
}

// RequestInit 인터페이스 확장
declare global {
  interface RequestInit {
    agent?: any;
  }
}