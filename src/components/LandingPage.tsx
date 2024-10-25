'use client';

import React, { useState, useEffect } from 'react';
import StockPortfolioList from '@src/components/StockPortfolioList';

import { User, ExchangeRate } from '@src/types';

const LandingPage = ({ user }: { user: User | null }) => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch(`https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${process.env.EXCHANGE_API_KEY}&data=AP01`);
        const data = await response.json();
        const usd = data.find((item: { cur_unit: string }) => item.cur_unit === 'USD');
        console.log(`매수 환율: ${usd.ttb}`);
        console.log(`매도 환율: ${usd.tts}`);
        setExchangeRates(data);
      } catch (error) {
        console.error('환율 정보를 가져오는 데 실패했습니다:', error);
      }
    };

    fetchExchangeRates();
  }, []);

  return (
    <div className="max-md:px-4 max-w-screen-xl mt-24 mx-auto bg-primary pt-24">
      <h1 className="text-lg mb-10 font-bold text-primary-foreground">환영합니다, {user?.nickname} 님!</h1>
      {/* <StockPortfolioList exchangeRates={exchangeRates} /> */}
    </div>
  );
};

export default LandingPage;