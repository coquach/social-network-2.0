'use client';

import * as React from 'react';
import { CalendarRange, RotateCcw, Search } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

import { TargetType } from '@repo/shared';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AppealStatus,
  FinalDecision,
  FinalDecisionFilter,
  ModerationAction,
  Severity,
} from '@/models/moderation/enums/moderationEnum';

export type ModerationViolationToolbarValue = {
  search: string;
  targetType: TargetType | 'all';
  action: ModerationAction | 'all';
  finalDecision: FinalDecisionFilter | 'all';
  fromDate: string;
  toDate: string;
};

export type ModerationAppealsToolbarValue = {
  search: string;
  appealStatus: AppealStatus | 'all';
};

type ViolationProps = {
  variant: 'violations';
  value: ModerationViolationToolbarValue;
  onChange: (next: ModerationViolationToolbarValue) => void;
  onReset: () => void;
  loading?: boolean;
  children?: React.ReactNode;
};

type AppealProps = {
  variant: 'appeals';
  value: ModerationAppealsToolbarValue;
  onChange: (next: ModerationAppealsToolbarValue) => void;
  onReset: () => void;
  loading?: boolean;
  children?: React.ReactNode;
};

type Props = ViolationProps | AppealProps;

const labelClass =
  'mb-1 text-[12px] font-medium tracking-wide text-slate-500';

const controlClass =
  'h-9 rounded-lg border-slate-200 bg-white text-xs shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-sky-100';

export function ModerationToolbar(props: Props) {
  const [search, setSearch] = React.useState(props.value.search);

  React.useEffect(() => {
    setSearch(props.value.search);
  }, [props.value.search]);

  const debouncedSearch = useDebouncedCallback(
    (text: string) => {
      props.onChange({ ...props.value, search: text } as any);
    },
    300,
    { maxWait: 800 },
  );

  if (props.variant === 'violations') {
    const value = props.value;

    return (
      <div className="space-y-2.5">
        {/* Row 1: Search & Core Filters */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-[1fr_130px_160px_185px]">
          {/* Search */}
          <div>
            <div className={labelClass}>Tìm kiếm</div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setSearch(nextValue);
                  debouncedSearch(nextValue);
                }}
                placeholder="Nội dung, người dùng..."
                className={`${controlClass} pl-8`}
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <div className={labelClass}>Loại</div>
            <Select
              value={value.targetType}
              onValueChange={(next) =>
                props.onChange({
                  ...value,
                  targetType: next as TargetType | 'all',
                })
              }
            >
              <SelectTrigger className={`${controlClass} w-full truncate text-left`}>
                <SelectValue placeholder="Loại" className="truncate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value={TargetType.POST}>Bài viết</SelectItem>
                <SelectItem value={TargetType.SHARE}>Chia sẻ</SelectItem>
                <SelectItem value={TargetType.COMMENT}>Bình luận</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action */}
          <div>
            <div className={labelClass}>Hình thức</div>
            <Select
              value={value.action}
              onValueChange={(next) =>
                props.onChange({
                  ...value,
                  action: next as ModerationAction | 'all',
                })
              }
            >
              <SelectTrigger className={`${controlClass} w-full truncate text-left`}>
                <SelectValue placeholder="Hình thức" className="truncate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value={ModerationAction.HARD_BLOCK}>
                  Chặn nội dung
                </SelectItem>
                <SelectItem value={ModerationAction.ALLOW_WITH_WARNING}>
                  Cảnh báo
                </SelectItem>
                <SelectItem value={ModerationAction.ALLOW_WITH_SUPPORT}>
                  Hỗ trợ
                </SelectItem>
                <SelectItem value={ModerationAction.ALLOW}>
                  Cho phép
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Decision */}
          <div>
            <div className={labelClass}>Quyết định xử lý</div>
            <Select
              value={value.finalDecision}
              onValueChange={(next) =>
                props.onChange({
                  ...value,
                  finalDecision: next as FinalDecisionFilter | 'all',
                })
              }
            >
              <SelectTrigger className={`${controlClass} w-full truncate text-left`}>
                <SelectValue placeholder="Quyết định" className="truncate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value={FinalDecisionFilter.AUTO}>
                  Tự động (AI)
                </SelectItem>
                <SelectItem value={FinalDecisionFilter.NO_VIOLATION}>
                  Thủ công - Khôi phục
                </SelectItem>
                <SelectItem value={FinalDecisionFilter.VIOLATION}>
                  Thủ công - Vi phạm
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Date Range, Reset, and Slot */}
        <div className="flex flex-wrap items-end gap-2.5">
          {/* From */}
          <div className="w-[calc(50%-5px)] sm:w-40">
            <div className={labelClass}>Từ ngày</div>
            <div className="relative">
              <CalendarRange className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                type="date"
                value={value.fromDate}
                onChange={(event) =>
                  props.onChange({
                    ...value,
                    fromDate: event.target.value,
                  })
                }
                className={`${controlClass} pl-8`}
              />
            </div>
          </div>

          {/* To */}
          <div className="w-[calc(50%-5px)] sm:w-40">
            <div className={labelClass}>Đến ngày</div>
            <div className="relative">
              <CalendarRange className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                type="date"
                value={value.toDate}
                min={value.fromDate || undefined}
                onChange={(event) =>
                  props.onChange({
                    ...value,
                    toDate: event.target.value,
                  })
                }
                className={`${controlClass} pl-8`}
              />
            </div>
          </div>

          {/* Reset */}
          <div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-lg border-slate-200 px-3 text-xs text-slate-600 shadow-xs hover:bg-slate-50"
              onClick={props.onReset}
              disabled={props.loading}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Đặt lại
            </Button>
          </div>

          {props.children && (
            <div className="ml-auto">
              {props.children}
            </div>
          )}
        </div>
      </div>
    );
  }

  const value = props.value;

  return (
    <div className="flex flex-wrap items-end gap-2.5">
      {/* Search */}
      <div className="min-w-[200px] flex-1">
        <div className={labelClass}>Tìm kiếm</div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => {
              const nextValue = event.target.value;
              setSearch(nextValue);
              debouncedSearch(nextValue);
            }}
            placeholder="Appeal ID, user..."
            className={`${controlClass} pl-8`}
          />
        </div>
      </div>

      {/* Status */}
      <div className="w-full sm:w-44">
        <div className={labelClass}>Trạng thái</div>
        <Select
          value={value.appealStatus}
          onValueChange={(next) =>
            props.onChange({
              ...value,
              appealStatus: next as AppealStatus | 'all',
            })
          }
        >
          <SelectTrigger className={`${controlClass} w-full truncate text-left`}>
            <SelectValue placeholder="Trạng thái" className="truncate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value={AppealStatus.PENDING}>Đang chờ</SelectItem>
            <SelectItem value={AppealStatus.APPROVED}>Đã duyệt</SelectItem>
            <SelectItem value={AppealStatus.REJECTED}>Bị từ chối</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset */}
      <div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-slate-200 px-3 text-xs text-slate-600 shadow-xs hover:bg-slate-50"
          onClick={props.onReset}
          disabled={props.loading}
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Đặt lại
        </Button>
      </div>

      {props.children && (
        <div className="ml-auto">
          {props.children}
        </div>
      )}
    </div>
  );
}
