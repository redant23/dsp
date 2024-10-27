'use client';

import React, { useState, useEffect } from 'react';
import StockPortfolioList from '@src/components/StockPortfolioList';

import { User, ExchangeRate } from '@src/types';

const LandingPage = ({ user }: { user: User | null }) => {
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>({ buy: 0, sell: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch('/api/exchangeRate');
        const data = await response.json();
        if (data.error) {
          console.error('환율 정보를 가져오는 데 실패했습니다:', data.error);
          return;
        }
        const buy = Number(data.buy.replace(/,/g, ''));
        const sell = Number(data.sell.replace(/,/g, ''));
        setExchangeRate({ buy, sell });
      } catch (error) {
        console.error('환율 정보를 가져오는 데 실패했습니다:', error);
      }
    };

    fetchExchangeRates();
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="mt-24 mx-auto bg-primary pt-24">
      <h1 className="text-lg mb-10 font-bold text-primary-foreground">환영합니다, {user?.nickname || ''} 님!</h1>
      <StockPortfolioList exchangeRate={exchangeRate} />
    </div>
  );
};

export default LandingPage;