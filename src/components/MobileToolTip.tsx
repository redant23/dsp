import { PortfolioStock } from "@src/types";
import { format } from "date-fns";

const MobileTooltip: React.FC<{ stock: PortfolioStock | null; onClick?: () => void }> = ({ stock, onClick }) => {
  
  return (
    <div className="fixed inset-0 w-full h-ful z-[100] bg-black/50" onClick={onClick}>
      <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 space-y-2 mx-auto w-fit bg-primary/80 p-4 rounded-lg shadow-lg" >
        <div>
          <span className="font-semibold">구매일자:</span> {stock?.purchaseDate ? format(stock.purchaseDate, 'yy.MM.dd') : '없음'}
        </div>
        <div>
          <span className="font-semibold">카테고리:</span> {stock?.category}
        </div>
        <div>
          <span className="font-semibold">종목명:</span> {stock?.name}
        </div>
        <div>
          <span className="font-semibold">주당 가격($):</span> {stock?.priceUSD}
        </div>
        <div>
          <span className="font-semibold">주당 배당금($):</span> {stock?.dividendUSD}
        </div>
        <div>
          <span className="font-semibold">작년 배당금:</span> {stock?.lastYearTotalDividend}
        </div>
        <div>
          <span className="font-semibold">올해 배당금:</span> {stock?.currentYearTotalDividend}
        </div>
      </div>
    </div>
  );
};

export default MobileTooltip;