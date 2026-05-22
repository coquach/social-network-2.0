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
  Severity,
} from '@/models/moderation/enums/moderationEnum';

export type ModerationViolationToolbarValue = {
  search: string;
  targetType: TargetType | 'all';
  maxSeverity: Severity | 'all';
  finalDecision: FinalDecision | 'all';
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
};

type AppealProps = {
  variant: 'appeals';
  value: ModerationAppealsToolbarValue;
  onChange: (next: ModerationAppealsToolbarValue) => void;
  onReset: () => void;
  loading?: boolean;
};

type Props = ViolationProps | AppealProps;

const labelClass =
  'mb-1.5 text-[12px] font-medium tracking-wide text-slate-500';

const controlClass =
  'h-10 rounded-lg border-slate-200 bg-white shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-sky-100';

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
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(300px,1fr)_140px_140px_150px_165px_165px_auto]">
        {/* Search */}
        <div>
          <div className={labelClass}>Tìm kiếm</div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              value={search}
              onChange={(event) => {
                const nextValue = event.target.value;
                setSearch(nextValue);
                debouncedSearch(nextValue);
              }}
              placeholder="Nội dung, người dùng..."
              className={`${controlClass} pl-9`}
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
            <SelectTrigger className={controlClass}>
              <SelectValue placeholder="Loại" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={TargetType.POST}>Bài viết</SelectItem>
              <SelectItem value={TargetType.SHARE}>Chia sẻ</SelectItem>
              <SelectItem value={TargetType.COMMENT}>Bình luận</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Severity */}
        <div>
          <div className={labelClass}>Mức độ</div>

          <Select
            value={value.maxSeverity}
            onValueChange={(next) =>
              props.onChange({
                ...value,
                maxSeverity: next as Severity | 'all',
              })
            }
          >
            <SelectTrigger className={controlClass}>
              <SelectValue placeholder="Mức độ" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={Severity.LOW}>Thấp</SelectItem>
              <SelectItem value={Severity.MEDIUM}>Trung bình</SelectItem>
              <SelectItem value={Severity.HIGH}>Cao</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Decision */}
        <div>
          <div className={labelClass}>Kết quả</div>

          <Select
            value={value.finalDecision}
            onValueChange={(next) =>
              props.onChange({
                ...value,
                finalDecision: next as FinalDecision | 'all',
              })
            }
          >
            <SelectTrigger className={controlClass}>
              <SelectValue placeholder="Kết quả" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>

              <SelectItem value={FinalDecision.VIOLATION}>Vi phạm</SelectItem>

              <SelectItem value={FinalDecision.NO_VIOLATION}>
                Không VP
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* From */}
        <div>
          <div className={labelClass}>Từ ngày</div>

          <div className="relative">
            <CalendarRange className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              type="date"
              value={value.fromDate}
              onChange={(event) =>
                props.onChange({
                  ...value,
                  fromDate: event.target.value,
                })
              }
              className={`${controlClass} pl-9`}
            />
          </div>
        </div>

        {/* To */}
        <div>
          <div className={labelClass}>Đến ngày</div>

          <div className="relative">
            <CalendarRange className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

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
              className={`${controlClass} pl-9`}
            />
          </div>
        </div>

        {/* Reset */}
        <div className="flex items-end">
          <Button
            variant="outline"
            className="h-10 rounded-lg border-slate-200 px-4 shadow-sm hover:bg-slate-50"
            onClick={props.onReset}
            disabled={props.loading}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    );
  }

  const value = props.value;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(300px,1fr)_180px_auto]">
      {/* Search */}
      <div>
        <div className={labelClass}>Tìm kiếm</div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            value={search}
            onChange={(event) => {
              const nextValue = event.target.value;
              setSearch(nextValue);
              debouncedSearch(nextValue);
            }}
            placeholder="Appeal ID, user..."
            className={`${controlClass} pl-9`}
          />
        </div>
      </div>

      {/* Status */}
      <div>
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
          <SelectTrigger className={controlClass}>
            <SelectValue placeholder="Trạng thái" />
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
      <div className="flex items-end">
        <Button
          variant="outline"
          className="h-10 rounded-lg border-slate-200 px-4 shadow-sm hover:bg-slate-50"
          onClick={props.onReset}
          disabled={props.loading}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
