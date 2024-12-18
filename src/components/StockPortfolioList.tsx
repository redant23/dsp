'use client';

import React,{ useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@src/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@src/components/ui/select";
import { Button } from "@src/components/ui/button";
import { Input } from "@src/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@src/components/ui/dialog";
import { X, Plus, CalendarIcon, ListX } from 'lucide-react';
import { StockPortfolioListProps, ExchangeRate } from '@src/types';
import { Calendar } from "@src/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@src/components/ui/popover";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useSession } from 'next-auth/react';
import MonthBadges from "@src/components/MonthBadges";
import { useMediaQuery } from '@src/hooks/useMediaQuery';
import { PortfolioStock } from '@src/types';
import MobileTooltip from '@src/components/MobileToolTip';

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0].replace(/-/g, '.');
};

const StockPortfolioList: React.FC<StockPortfolioListProps> = ({ exchangeRate }: { exchangeRate: ExchangeRate }) => {
  const [userStocks, setUserStocks] = useState<PortfolioStock[]>([]);
  const [filter, setFilter] = useState<'전체' | '보유예정' | '보유중' | '매도'>('전체');
  const [newTicker, setNewTicker] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [stockToDelete, setStockToDelete] = useState<string | null>(null);
  const [currentDate] = useState(formatDate(new Date()));
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const { data: session } = useSession();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [openTooltip, setOpenTooltip] = useState(false);
  const [targetUserStock, setTargetUserStock] = useState<PortfolioStock | null>(null);
  
  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolio');
      if (!response.ok) throw new Error('포트폴리오 로드 실패');
      const data = await response.json();
      setUserStocks(data);
    } catch (error) {
      console.error('포트폴리오 로드 중 오류:', error);
    }
  };

  const statusOrder = {
    '보유중': 0,
    '보유예정': 1,
    '매도': 2
  };

  const filteredStocks = (filter === '전체' ? userStocks : userStocks.filter(userStock => userStock.status === filter))
  .sort((a, b) => {
    // 먼저 상태로 정렬
    const statusCompare = statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
    if (statusCompare !== 0) return statusCompare;
    
    // 상태가 같은 경우 구매일자로 정렬
    // 구매일자가 없는 경우는 가장 마지막으로
    if (!a.purchaseDate && !b.purchaseDate) {
      // 둘 다 구매일자가 없는 경우 종목명으로 정렬
      return a.name.localeCompare(b.name);
    }
    if (!a.purchaseDate) return 1;
    if (!b.purchaseDate) return -1;
    
    // 구매일자 비교
    const dateCompare = new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
    if (dateCompare !== 0) return dateCompare;
    
    // 구매일자가 같은 경우 종목명으로 정렬 (A-Z)
    return a.name.localeCompare(b.name);
  });

  const handleStatusChange = (_id: string, newStatus: string) => {
    setUserStocks(userStocks.map(userStock =>
      userStock._id === _id ? { ...userStock, status: newStatus } : userStock
    ));
    setIsDirty(true);
  };

  const handleQuantityChange = (_id: string, newQuantity: number) => {
    setUserStocks(userStocks.map(s => {
      if (s._id === _id) {
        const totalCostKRW = newQuantity * Math.round(s.priceUSD * exchangeRate.buy);
        const totalDividend = Math.round(s.dividendUSD * newQuantity * exchangeRate.sell);
        return {
          ...s,
          quantity: newQuantity,
          totalCostKRW,
          totalDividend
        };
      }
      return s;
    }));
    setIsDirty(true);
  };

  const handleDelete = (_id: string) => {
    setStockToDelete(_id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (stockToDelete !== null) {
      fetch(`/api/portfolio?id=${stockToDelete}`, {
        method: 'DELETE'
      }).catch(error => {
        console.error('포트폴리오 삭제 중 오류:', error);
      });
      setUserStocks(userStocks.filter(userStock => userStock._id !== stockToDelete));
      setIsDeleteModalOpen(false);
      setStockToDelete(null);
    }
  };

  // UserStock에 주식 추가, Stock DB에 해당 주식 없는 경우 함께 추가
  const handleAddStock = async () => {
    try {
      if (!newTicker) {
        alert('티커를 입력해주세요.');
        return;
      }

      // 현재 입력한 종목이 이미 목록에 존재하는 종목인지 확인
      const existingStock = userStocks.find(stock => stock.ticker === newTicker.toUpperCase());
      if (existingStock) {
        alert('이미 목록에 존재하는 종목입니다.');
        return;
      }

      // Stock DB에 종목 존재여부 조회
      const response = await fetch(`/api/stock?ticker=${newTicker.toUpperCase()}`);
      let stockInfo = await response.json();
      
      
      // 409 에러인 경우(업데이트 주기가 지난 상황) PUT 요청으로 Stock DB 업데이트
      if (response.status === 409) {
        const updateResponse = await fetch(`/api/stock?ticker=${newTicker.toUpperCase()}`, {
          method: 'PUT'
        });
        if (!updateResponse.ok) {
          alert('주식 정보 업데이트에 실패했습니다.');
          return;
        }
        stockInfo = await updateResponse.json();
      }

      // stock DB에 종목 정보가 없는 경우(새로 생성된 종목) POST 요청으로 Stock DB 새로 생성
      if (response.status === 400) {
        const createResponse = await fetch(`/api/stock?ticker=${newTicker.toUpperCase()}`, {
          method: 'POST'
        });
        
        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          console.log('createResponse error:', errorData);
          alert('새로운 주식 정보 생성에 실패했습니다.');
          return;
        }
        stockInfo = await createResponse.json();
      }
      
      const priceUSD = stockInfo.price || 0;
      const dividendUSD = stockInfo.dividendPerShare || 0;
      const priceKRW = Math.round(priceUSD * exchangeRate.buy);
      const dividendYield = stockInfo.dividendYield || 0;

      console.log('stockInfo', stockInfo);
      
      const newStock: PortfolioStock = {
        stock: stockInfo._id,
        user: session?.user?.id || '',
        status: '보유예정',
        category: stockInfo.sector || '미분류',
        name: stockInfo.name,
        ticker: stockInfo.symbol,
        priceUSD: priceUSD,
        dividendUSD: Number(dividendUSD.toFixed(2)),
        priceKRW: priceKRW,
        dividendYield: Number((dividendYield * 100).toFixed(2)),
        quantity: 1,
        totalCostKRW: priceKRW,
        totalDividend: Math.round(dividendUSD * exchangeRate.sell),
        lastYearTotalDividend: stockInfo.lastYearTotalDividend,
        currentYearTotalDividend: stockInfo.currentYearTotalDividend,
        paymentMonth: stockInfo.paymentMonths || '정보 없음'
      };

      // newStock 데이터를 userStock DB에 추가
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStock)
      });

      if (!res.ok) {
        alert('주식 추가에 실패했습니다.');
        return;
      }

      const newUserStock = await res.json();
      console.log('newUserStock', newUserStock);
      setUserStocks([...userStocks, newUserStock]);
      setNewTicker('');
    } catch (error) {
      console.error('주식 추가 중 오류 발생:', error);
      alert('주식 정보를 가져오는데 실패했습니다.');
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // 모든 수정된 주식 데이터를 한 번에 전송
      const response = await fetch('/api/portfolio/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userStocks.map((userStock: any) => ({
            _id: userStock._id,
            user: userStock.user,
            stock: userStock.stock._id,
            status: userStock.status,
            quantity: userStock.quantity,
            purchaseDate: userStock.purchaseDate,
            sellDate: userStock.sellDate,
            updatedAt: new Date()
        })))
      });
  
      if (!response.ok) {
        throw new Error('포트폴리오 업데이트 실패');
      }
  
      setIsDirty(false);
    } catch (error) {
      console.error('저장 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTooltip = (userStock: PortfolioStock) => {
    setOpenTooltip(true);
    setTargetUserStock(userStock);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">주식 포트폴리오</h1>
        <div>
          <span className="mr-4">{currentDate} 기준</span>
          <span className="mr-4">매수환율: {exchangeRate.buy.toLocaleString()}원</span>
          <span>매도환율: {exchangeRate.sell.toLocaleString()}원</span>
        </div>
      </div>

      <div className="mb-4 flex justify-end">
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-[180px] border-border/50 dark:border-border/50 border-2">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent className="border-accent">
            <SelectItem value="전체">전체보기</SelectItem>
            <SelectItem value="보유예정">보유예정</SelectItem>
            <SelectItem value="보유중">보유중</SelectItem>
            <SelectItem value="매도">매도</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {userStocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-primary/10 rounded-lg">
          <ListX className="text-accent h-16 w-16 mb-4" />
          <p className="text-accent text-lg">현재 리스팅된 종목이 없습니다.</p>
          <p className="text-primary-foreground mt-2">하단에 원하는 티커를 입력하여 종목을 추가해 보세요.</p>
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-accent/80">
            <TableRow>
              <TableHead className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">상태</TableHead>
              {!isMobile && (
                <>
                  <TableHead className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">구매일자</TableHead>
                  <TableHead className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">카테고리</TableHead>
                  <TableHead className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">종목명</TableHead>
                </>
              )}
              <TableHead className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">티커</TableHead>
              {!isMobile && (
                <>
                  <TableHead className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">주당 가격($)</TableHead>
                  <TableHead className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">주당 배당금($)</TableHead>
                </>
              )}
              <TableHead className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">주당 가격(₩)</TableHead>
              <TableHead className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">배당율</TableHead>
              <TableHead className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">보유 수량</TableHead>
              <TableHead className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">주식 구매비용(₩)</TableHead>
              <TableHead className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">총 배당 금액</TableHead>
              {!isMobile && (
                <>
                  <TableHead className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">작년 배당금총액(지급횟수)</TableHead>
                  <TableHead className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">올해 배당금총액(지급횟수)</TableHead>
                </>
              )}
              <TableHead className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">지급월</TableHead>
              <TableHead className="py-2 px-2 text-center text-muted-foreground whitespace-nowrap">삭제</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStocks.map((userStock, index) => (
              isMobile ? (
                <TableRow key= {userStock._id} onClick={() => handleTooltip(userStock)} className={`${index % 2 === 0 ? 'bg-primary/30' : ''} border-border/10`}>
                  <TableCell className="px-1 text-center">
                    <Select value={userStock.status} onValueChange={(value: any) => handleStatusChange(userStock._id || '', value)}>
                      <SelectTrigger className={`text-${userStock.status === '보유예정' ? 'warning' : userStock.status === '보유중' ? 'success' : 'destructive'}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem className="text-warning" value="보유예정">보유예정</SelectItem>
                        <SelectItem className="text-success" value="보유중">보유중</SelectItem>
                        <SelectItem className="text-destructive" value="매도">매도</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  {!isMobile && (
                    <TableCell className="text-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-[96px] px-2 gap-0.5 justify-start text-left font-normal">
                            <CalendarIcon className="mr-1 h-4 w-4" />
                            {userStock.purchaseDate ? format(userStock.purchaseDate, 'yy.MM.dd') : ''}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown-buttons"
                            selected={userStock.purchaseDate}
                            onSelect={(date) => {
                              if (date) {
                                setUserStocks(userStocks.map(s =>
                                  s._id === userStock._id ? { ...s, purchaseDate: date } : s
                                ));
                              }
                            }}
                            fromYear={2000}
                            toYear={2030}
                            locale={ko}
                          />
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  )}
                  <TableCell className="text-center p-2">{userStock.ticker}</TableCell>
                  <TableCell className="text-center p-2">{Math.round(userStock.priceUSD * exchangeRate.buy).toLocaleString()}</TableCell>
                  <TableCell className="text-center p-2">{Number(userStock.dividendYield * 100).toFixed(2)}%</TableCell>
                  <TableCell className="text-center p-2">
                    <Input
                      className="w-12 px-1 text-center" 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={userStock.quantity}
                      onChange={(e) => {
                        const numValue = e.target.value.replace(/[^0-9]/g, '');
                        e.target.value = Number(numValue) > 9999 ? '9999' : numValue;
                        handleQuantityChange(userStock._id || '', parseInt(e.target.value) || 1);
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-center p-2">{(Math.round(userStock.priceUSD * exchangeRate.buy) * userStock.quantity).toLocaleString()}원</TableCell>
                  <TableCell className="text-center p-2">{Math.round(userStock.dividendUSD * userStock.quantity * exchangeRate.sell).toLocaleString()}원</TableCell>
                  <TableCell className={`p-2 ${!isMobile ? 'min-w-[13rem]' : ''}`}>
                    <MonthBadges months={userStock.paymentMonth} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" className="hover:bg-destructive/80 hover:text-destructive-foreground" size="icon" onClick={() => handleDelete(userStock._id || '')}>
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow className={`${index % 2 === 0 ? 'bg-primary/30' : ''} border-border/10`} key={userStock._id}>
                  <TableCell className="px-1 text-center">
                    <Select value={userStock.status} onValueChange={(value: any) => handleStatusChange(userStock._id || '', value)}>
                      <SelectTrigger className={`text-${userStock.status === '보유예정' ? 'warning' : userStock.status === '보유중' ? 'success' : 'destructive'}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem className="text-warning" value="보유예정">보유예정</SelectItem>
                        <SelectItem className="text-success" value="보유중">보유중</SelectItem>
                        <SelectItem className="text-destructive" value="매도">매도</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[96px] px-2 gap-0.5 justify-start text-left font-normal">
                          <CalendarIcon className="mr-1 h-4 w-4" />
                          {userStock.purchaseDate ? format(userStock.purchaseDate, 'yy.MM.dd') : ''}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          captionLayout="dropdown"
                          mode="single"
                          selected={userStock.purchaseDate}
                          onSelect={(date) => {
                            if (date) {
                              setUserStocks(userStocks.map(s =>
                                s._id === userStock._id ? { ...s, purchaseDate: date } : s
                              ));
                            }
                          }}
                          locale={ko}
                        />
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  {!isMobile && (
                    <>
                      <TableCell className="text-center p-2">{userStock.category}</TableCell>
                      <TableCell className="text-center p-2">{userStock.name}</TableCell>
                    </>
                  )}
                  <TableCell className="text-center p-2">{userStock.ticker}</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell className="text-center p-2">{userStock.priceUSD}</TableCell>
                      <TableCell className="text-center p-2">{userStock.dividendUSD}</TableCell>
                    </>
                  )}
                  <TableCell className="text-center p-2">{Math.round(userStock.priceUSD * exchangeRate.buy).toLocaleString()}</TableCell>
                  <TableCell className="text-center p-2">{Number(userStock.dividendYield * 100).toFixed(2)}%</TableCell>
                  <TableCell className="text-center p-2">
                    <Input
                      className="w-12 px-1 text-center" 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={userStock.quantity}
                      onChange={(e) => {
                        const numValue = e.target.value.replace(/[^0-9]/g, '');
                        e.target.value = Number(numValue) > 9999 ? '9999' : numValue;
                        handleQuantityChange(userStock._id || '', parseInt(e.target.value) || 1);
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-center p-2">{(Math.round(userStock.priceUSD * exchangeRate.buy) * userStock.quantity).toLocaleString()}원</TableCell>
                  <TableCell className="text-center p-2">{Math.round(userStock.dividendUSD * userStock.quantity * exchangeRate.sell).toLocaleString()}원</TableCell>
                  <TableCell className="text-center p-2">{userStock.lastYearTotalDividend}</TableCell>
                  <TableCell className="text-center p-2">{userStock.currentYearTotalDividend}</TableCell>
                  <TableCell className="p-2 min-w-[13rem]">
                    <MonthBadges months={userStock.paymentMonth} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" className="hover:bg-destructive/80 hover:text-destructive-foreground" size="icon" onClick={() => handleDelete(userStock._id || '')}>
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            ))}
          </TableBody>
        </Table>
      )}
      {isMobile && openTooltip && (
        <MobileTooltip onClick={() => setOpenTooltip(false)} stock={targetUserStock} />
      )}
      <div className="mt-4 flex items-center">
        <Input
          type="text"
          placeholder="티커 입력"
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value)}
          className="mr-2 border-border"
        />
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleAddStock}>
          <Plus className="h-4 w-4 mr-2" />
          추가
        </Button>
        {isDirty && (
          <div className="relative">
            <div className="absolute bottom-[-80px] right-0 flex gap-2">
              <Button 
                className="bg-primary text-primary-foreground hover:text-primary-foreground/90 hover:bg-primary/90"
                variant="outline" 
                onClick={() => {
                  fetchPortfolio();
                  setIsDirty(false);
                }}
              >
                취소
              </Button>
              <Button 
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? '저장 중...' : '변경사항 저장'}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>삭제 확인</DialogTitle>
          </DialogHeader>
          <p>정말로 이 항목을 삭제하시겠습니까?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>취소</Button>
            <Button variant="destructive" onClick={confirmDelete}>삭제</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default StockPortfolioList;
