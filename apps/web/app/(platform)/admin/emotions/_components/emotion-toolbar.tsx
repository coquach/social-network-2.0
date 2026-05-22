'use client';

import * as React from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RiskLevel } from '@/models/emotion/adminEmotionDTO';

export type EmotionRiskToolbarValue = {
  search: string;
  riskLevel: RiskLevel | 'all';
};

type Props = {
  value: EmotionRiskToolbarValue;
  onChange: (value: EmotionRiskToolbarValue) => void;
  onRefresh: () => void;
  loading?: boolean;
};

const labelClass =
  'mb-1.5 text-[12px] font-medium tracking-wide text-slate-500';
const controlClass =
  'h-10 rounded-lg border-slate-200 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-sky-100';

export function EmotionToolbar({ value, onChange, onRefresh, loading }: Props) {
  const [search, setSearch] = React.useState(value.search);

  React.useEffect(() => {
    setSearch(value.search);
  }, [value.search]);

  const debouncedSearch = useDebouncedCallback(
    (nextSearch: string) => {
      onChange({ ...value, search: nextSearch });
    },
    300,
    { maxWait: 800 },
  );

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(280px,1fr)_180px_auto]">
      <div>
        <div className={labelClass}>Tìm kiếm</div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => {
              const nextSearch = event.target.value;
              setSearch(nextSearch);
              debouncedSearch(nextSearch);
            }}
            placeholder="User ID, tag, signal..."
            className={`${controlClass} pl-9`}
          />
        </div>
      </div>

      <div>
        <div className={labelClass}>Mức độ rủi ro</div>
        <Select
          value={value.riskLevel}
          onValueChange={(nextLevel) =>
            onChange({ ...value, riskLevel: nextLevel as RiskLevel | 'all' })
          }
        >
          <SelectTrigger className={controlClass}>
            <SelectValue placeholder="Mức độ rủi ro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="normal">Bình thường</SelectItem>
            <SelectItem value="warning">Cảnh báo</SelectItem>
            <SelectItem value="high">Cao</SelectItem>
            <SelectItem value="critical">Nguy hiểm</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        <Button
          variant="outline"
          className="h-10 rounded-lg border-slate-200 px-4 shadow-sm hover:bg-slate-50"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
      </div>
    </div>
  );
}
