import React from 'react';
import { Badge } from "@src/components/ui/badge";

const monthToSeason = (month: string): "spring" | "summer" | "fall" | "winter" | "everyMonth" => {
  if (month === '매월') return "everyMonth";
  const monthNum = parseInt(month);
  if (monthNum >= 3 && monthNum <= 5) return "spring";
  if (monthNum >= 6 && monthNum <= 8) return "summer";
  if (monthNum >= 9 && monthNum <= 11) return "fall";
  return "winter";
};

interface MonthBadgesProps {
  months: string;
}

const MonthBadges: React.FC<MonthBadgesProps> = ({ months }) => {
  if (!months || months === '정보 없음') return <span>정보 없음</span>;

  return (
    <div className="flex gap-1 flex-wrap">
      {months.split(',').map((month) => {
        const cleanMonth = month === '매월' ? '매월' : month.trim().replace('월', '');
        return (
          <Badge
            className="rounded-sm text-sm px-[0.3rem]"
            key={month} 
            variant={monthToSeason(cleanMonth)}
          >
            {month.trim()}
          </Badge>
        );
      })}
    </div>
  );
};

export default MonthBadges;