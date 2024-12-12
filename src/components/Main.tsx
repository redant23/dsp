'use client';

import { Button } from '@src/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@src/components/ui/card';
import { FaChartLine, FaMoneyBillWave, FaRegCalendarAlt } from 'react-icons/fa';

const Main = () => {
  return (
    <main className="min-h-screen pt-24 pb-12 bg-primary">
      <div className="max-w-7xl mx-auto px-4">
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-4">
            R.T.R
            <span className="block text-lg md:text-xl text-accent mt-2">Road To Rich</span>
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            당신의 투자 여정을 체계적으로 기록하고 관리하세요
          </p>
        </section>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="bg-primary-foreground/5 border-accent/20">
            <CardHeader>
              <FaChartLine className="w-8 h-8 text-accent mb-4" />
              <CardTitle className="text-primary-foreground">트레이딩 기록</CardTitle>
              <CardDescription className="text-primary-foreground/70">
                매매 기록을 체계적으로 관리하여 투자 실력을 향상시키세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>• 매매 일지 작성</li>
                <li>• 수익률 분석</li>
                <li>• 투자 패턴 파악</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-primary-foreground/5 border-accent/20">
            <CardHeader>
              <FaMoneyBillWave className="w-8 h-8 text-accent mb-4" />
              <CardTitle className="text-primary-foreground">배당금 관리</CardTitle>
              <CardDescription className="text-primary-foreground/70">
                배당 수익을 한눈에 파악하고 관리하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>• 배당금 캘린더</li>
                <li>• 월별 배당금 현황</li>
                <li>• 배당주 포트폴리오</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-primary-foreground/5 border-accent/20">
            <CardHeader>
              <FaRegCalendarAlt className="w-8 h-8 text-accent mb-4" />
              <CardTitle className="text-primary-foreground">투자 일정</CardTitle>
              <CardDescription className="text-primary-foreground/70">
                중요한 투자 일정을 놓치지 마세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>• 배당금 지급일</li>
                <li>• 실적 발표일</li>
                <li>• 주주총회 일정</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            className="bg-accent hover:bg-accent/90 text-primary-foreground px-8 py-6 text-lg"
            size="lg"
          >
            지금 시작하기
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Main;
