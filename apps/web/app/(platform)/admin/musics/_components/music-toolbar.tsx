'use client';

import { RefreshCw, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MusicGenre } from '@/models/music/musicDTO';

import { musicGenreLabels } from './music-utils';

type MusicToolbarProps = {
  search: string;
  genre: MusicGenre | 'all';
  total: number;
  refreshing?: boolean;
  onSearchChange: (value: string) => void;
  onGenreChange: (value: MusicGenre | 'all') => void;
  onRefresh: () => void;
};

export function MusicToolbar({
  search,
  genre,
  total,
  refreshing,
  onSearchChange,
  onGenreChange,
  onRefresh,
}: MusicToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.7fr)_220px_auto] lg:items-end">
        <div className="space-y-1.5">
          <div className="text-[13px] font-medium tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Tìm kiếm
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Tìm theo tên nhạc, nghệ sĩ..."
              className="h-11 rounded-xl border-slate-200 bg-white pl-9 shadow-sm dark:border-slate-800 dark:bg-slate-950"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-[13px] font-medium tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Thể loại
          </div>
          <Select
            value={genre}
            onValueChange={(value) =>
              onGenreChange(value as MusicGenre | 'all')
            }
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <SelectValue placeholder="Chọn thể loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thể loại</SelectItem>
              {Object.entries(musicGenreLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            className="h-11 rounded-xl border-slate-200 bg-white px-4 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
          >
            <RefreshCw
              className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
            />
            Làm mới
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-4 dark:border-slate-800">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Tìm thấy{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {total}
          </span>{' '}
          bản ghi
        </div>

        <Badge className="rounded-full border-0 bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Dashboard media
        </Badge>
      </div>
    </div>
  );
}
