'use client';

import * as React from 'react';
import { RotateCcw, Search } from 'lucide-react';
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
import { ContentEntryFilter } from '@/lib/actions/admin/content-entry-action';
import { TargetType } from '@/models/social/enums/social.enum';
import { ContentStatus } from '@/models/social/post/contentEntryDTO';

const targetLabels: Record<TargetType, string> = {
  [TargetType.POST]: 'Bài viết',
  [TargetType.SHARE]: 'Chia sẻ',
  [TargetType.COMMENT]: 'Bình luận',
};

const statusLabels: Record<ContentStatus, string> = {
  [ContentStatus.ACTIVE]: 'Đang hiển thị',
  [ContentStatus.VIOLATED]: 'Vi phạm',
};

type ContentToolbarProps = {
  filter: ContentEntryFilter;
  onFilterChange: (changes: Partial<ContentEntryFilter>) => void;
  onReset: () => void;
};

function toDateInputValue(d?: Date | string | null) {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function ContentToolbar({
  filter,
  onFilterChange,
  onReset,
}: ContentToolbarProps) {
  const [keyword, setKeyword] = React.useState(filter.query ?? '');
  const [draftTargetType, setDraftTargetType] = React.useState<string>(
    filter.targetType ?? TargetType.POST
  );
  const [draftStatus, setDraftStatus] = React.useState<string>(
    filter.status ?? 'all'
  );
  const [draftCreateAt, setDraftCreateAt] = React.useState<string>(
    toDateInputValue(filter.createAt as any)
  );

  React.useEffect(() => {
    setKeyword(filter.query ?? '');
  }, [filter.query]);

  React.useEffect(() => {
    setDraftTargetType(filter.targetType ?? TargetType.POST);
  }, [filter.targetType]);

  React.useEffect(() => {
    setDraftStatus(filter.status ?? 'all');
  }, [filter.status]);

  React.useEffect(() => {
    setDraftCreateAt(toDateInputValue(filter.createAt as any));
  }, [filter.createAt]);
  const applyFilters = React.useCallback(
    (text: string, target: string, status: string, date: string) => {
      onFilterChange({
        query: text.trim() || undefined,
        targetType: target === 'all' ? undefined : (target as TargetType),
        status: status === 'all' ? undefined : (status as ContentStatus),
        createAt: date ? new Date(date) : undefined,
        page: 1,
      });
    },
    [onFilterChange]
  );
  React.useEffect(() => {
    applyFilters(keyword, draftTargetType, draftStatus, draftCreateAt);
  }, [draftTargetType, draftStatus, draftCreateAt, keyword]);

  const debouncedSearch = useDebouncedCallback(
    (text: string) => {
      applyFilters(text, draftTargetType, draftStatus, draftCreateAt);
    },
    300,
    { maxWait: 800 }
  );

  const reset = () => {
    setKeyword('');
    setDraftTargetType(TargetType.POST);
    setDraftStatus('all');
    setDraftCreateAt('');
    onReset();
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">
            Tìm kiếm nội dung
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={keyword}
              onChange={(e) => {
                const val = e.target.value;
                setKeyword(val);
                debouncedSearch(val);
              }}
              placeholder="Nội dung, từ khóa..."
              className="border-sky-100 pl-9 focus-visible:ring-sky-200"
            />
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">
            Loại nội dung
          </div>
          <Select
            value={draftTargetType}
            onValueChange={(value) => {
              setDraftTargetType(value);
              applyFilters(keyword, value, draftStatus, draftCreateAt);
            }}
          >
            <SelectTrigger className="border-sky-100 focus:ring-sky-200">
              <SelectValue placeholder="Chọn loại" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(targetLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">
              Trạng thái
          </div>
          <Select
            value={draftStatus}
            onValueChange={(value) => {
              setDraftStatus(value);
              applyFilters(keyword, draftTargetType, value, draftCreateAt);
            }}
          >
            <SelectTrigger className="border-sky-100 focus:ring-sky-200">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">
            Ngày tạo
          </div>
          <Input
            type="date"
            value={draftCreateAt}
            onChange={(e) => {
              const val = e.target.value;
              setDraftCreateAt(val);
              applyFilters(keyword, draftTargetType, draftStatus, val);
            }}
            className="border-sky-100 focus-visible:ring-sky-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:justify-end">
        <Button
          variant="outline"
          className="border-sky-200 text-slate-700 hover:bg-sky-50"
          onClick={reset}
        >
          <RotateCcw className="mr-1 h-4 w-4" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
