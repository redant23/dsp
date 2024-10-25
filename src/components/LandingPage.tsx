'use client';

import React, { useState, useEffect } from 'react';
import StockPortfolioList from '@src/components/StockPortfolioList';

import { User, ExchangeRate } from '@src/types';

const LandingPage = ({ user }: { user: User | null }) => {
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>({ buy: 500, sell: 400 });

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch('/api/exchangeRate');
        const data = await response.json();
        const usd = data.find((item: { cur_unit: string }) => item.cur_unit === 'USD');
        console.log(`매수 환율: ${usd.ttb}`);
        console.log(`매도 환율: ${usd.tts}`);
        setExchangeRate({ buy: usd.ttb, sell: usd.tts });
      } catch (error) {
        console.error('환율 정보를 가져오는 데 실패했습니다:', error);
      }
    };

    fetchExchangeRates();
  }, []);

  return (
    <div className="mt-24 mx-auto bg-primary pt-24">
      <h1 className="text-lg mb-10 font-bold text-primary-foreground">환영합니다, {user?.nickname} 님!</h1>
      <StockPortfolioList exchangeRate={exchangeRate} />
    </div>
  );
};

export default LandingPage;