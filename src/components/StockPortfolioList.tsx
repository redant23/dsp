'use client';

import React,{ useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@src/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@src/components/ui/select";
import { Button } from "@src/components/ui/button";
import { Input } from "@src/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@src/components/ui/dialog";
import { X, Plus } from 'lucide-react';
import { StockPortfolioListProps, ExchangeRate } from '@src/types';

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0].replace(/-/g, '.');
};

type Stock = {
  id: number;
  status: '보유예정' | '보유중' | '매도';
  purchaseDate: string;
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
  paymentMonth: string;
};

const StockPortfolioList: React.FC<StockPortfolioListProps> = ({ exchangeRate }: { exchangeRate: ExchangeRate }) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filter, setFilter] = useState<'전체' | '보유예정' | '보유중' | '매도'>('전체');
  const [newTicker, setNewTicker] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [stockToDelete, setStockToDelete] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(formatDate(new Date()));

  useEffect(() => {
    // 여기서 실제 API 호출을 통해 주식 데이터를 가져올 수 있습니다.
    setStocks([
      {
        id: 1,
        status: '보유중',
        purchaseDate: '2023-01-01',
        category: '기술',
        name: '애플',
        ticker: 'AAPL',
        priceUSD: 150,
        dividendUSD: 0.88,
        priceKRW: 195000,
        dividendYield: 0.59,
        quantity: 10,
        totalCostKRW: 1950000,
        totalDividend: 8800,
        paymentMonth: '2,5,8,11'
      },
      // 더 많은 주식 데이터...
    ]);
  }, []);

  const filteredStocks = filter === '전체' ? stocks : stocks.filter(stock => stock.status === filter);

  const handleStatusChange = (id: number, newStatus: '보유예정' | '보유중' | '매도') => {
    setStocks(stocks.map(stock =>
      stock.id === id ? { ...stock, status: newStatus } : stock
    ));
  };

  const handleDelete = (id: number) => {
    setStockToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (stockToDelete !== null) {
      setStocks(stocks.filter(stock => stock.id !== stockToDelete));
      setIsDeleteModalOpen(false);
      setStockToDelete(null);
    }
  };

  const handleAddStock = async () => {
    // 실제로는 여기서 API를 호출하여 주식 정보를 가져와야 합니다.
    // 이 예제에서는 간단히 더미 데이터를 추가합니다.
    const newStock: Stock = {
      id: stocks.length + 1,
      status: '보유예정',
      purchaseDate: new Date().toISOString().split('T')[0],
      category: '신규',
      name: `${newTicker} 주식`,
      ticker: newTicker,
      priceUSD: 100,
      dividendUSD: 1,
      priceKRW: 130000,
      dividendYield: 1,
      quantity: 1,
      totalCostKRW: 130000,
      totalDividend: 1000,
      paymentMonth: '1,4,7,10'
    };
    setStocks([...stocks, newStock]);
    setNewTicker('');
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="전체">전체보기</SelectItem>
            <SelectItem value="보유예정">보유예정</SelectItem>
            <SelectItem value="보유중">보유중</SelectItem>
            <SelectItem value="매도">매도</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader className="bg-accent/50">
          <TableRow>
            <TableHead>상태</TableHead>
            <TableHead>구매일자</TableHead>
            <TableHead>카테고리</TableHead>
            <TableHead>종목명</TableHead>
            <TableHead>티커</TableHead>
            <TableHead>주당 가격($)</TableHead>
            <TableHead>주당 배당금($)</TableHead>
            <TableHead>주당 가격(₩)</TableHead>
            <TableHead>배당율</TableHead>
            <TableHead>보유 수량</TableHead>
            <TableHead>주식 구매비용(₩)</TableHead>
            <TableHead>총 배당 금액</TableHead>
            <TableHead>지급월</TableHead>
            <TableHead>삭제</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStocks.map((stock) => (
            <TableRow key={stock.id}>
              <TableCell>
                <Select value={stock.status} onValueChange={(value: any) => handleStatusChange(stock.id, value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="보유예정">보유예정</SelectItem>
                    <SelectItem value="보유중">보유중</SelectItem>
                    <SelectItem value="매도">매도</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{stock.purchaseDate}</TableCell>
              <TableCell>{stock.category}</TableCell>
              <TableCell>{stock.name}</TableCell>
              <TableCell>{stock.ticker}</TableCell>
              <TableCell>{stock.priceUSD}</TableCell>
              <TableCell>{stock.dividendUSD}</TableCell>
              <TableCell>{stock.priceKRW}</TableCell>
              <TableCell>{stock.dividendYield}%</TableCell>
              <TableCell>{stock.quantity}</TableCell>
              <TableCell>{stock.totalCostKRW}</TableCell>
              <TableCell>{stock.totalDividend}</TableCell>
              <TableCell>{stock.paymentMonth}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(stock.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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