'use client';

import { CalendarRange, RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type DateRangeFilterProps = {
  from: string;
  to: string;
  fromMin?: string;
  fromMax?: string;
  toMin?: string;
  toMax?: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onQuickWeek: () => void;
};

export function DateRangeFilter({
  from,
  to,
  fromMin,
  fromMax,
  toMin,
  toMax,
  onFromChange,
  onToChange,
  onQuickWeek,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-sky-100 bg-white/90 p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex flex-col text-xs text-sky-600">
          <span className="font-semibold text-sky-600">Từ ngày</span>
          <Input
            type="date"
            lang="vi"
            min={fromMin}
            max={fromMax}
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className="h-9 w-40 border-sky-100 text-sm focus-visible:ring-sky-200"
          />
        </div>
      </div>
      <div className="flex flex-col text-xs text-sky-600">
        <span className="font-semibold text-sky-600">Đến ngày</span>
        <Input
          type="date"
          lang="vi"
          min={toMin}
          max={toMax}
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="h-9 w-40 border-sky-100 text-sm focus-visible:ring-sky-200"
        />
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
        onClick={onQuickWeek}
      >
        {' '}
        <RefreshCcw className="ml-1 h-4 w-4" />
        Tuần trước
      </Button>
    </div>
  );
}
