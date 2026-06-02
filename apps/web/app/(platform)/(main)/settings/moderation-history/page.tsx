'use client';

import * as React from 'react';

import { TargetType, useUserModerationHistory } from '@repo/shared';

import { ErrorFallback } from '@/components/error-fallback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCcw, SlidersHorizontal } from 'lucide-react';

import { ModerationDetailSheet } from './_components/moderation-history-detail-sheet';
import { EmptyModerationState } from './_components/moderation-history-empty-state';
import { ModerationHistoryItem } from './_components/moderation-history-item';
import { ModerationHistoryPagination } from './_components/moderation-history-pagination';
import { ModerationSkeletonList } from './_components/moderation-history-skeleton-list';
import { getTargetLabel } from './_components/moderation-history-utils';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const TARGET_TYPE_OPTIONS = [
  'all',
  TargetType.POST,
  TargetType.COMMENT,
  TargetType.SHARE,
] as const;

export default function SettingsModerationHistoryPage() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] =
    React.useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [targetType, setTargetType] =
    React.useState<(typeof TARGET_TYPE_OPTIONS)[number]>('all');
  const [selectedModerationId, setSelectedModerationId] = React.useState<
    string | null
  >(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const queryFilters = React.useMemo(
    () => ({
      page,
      limit: pageSize,
      targetType: targetType === 'all' ? undefined : targetType,
    }),
    [page, pageSize, targetType],
  );

  const moderationQuery = useUserModerationHistory(queryFilters);

  const totalPages = Math.max(1, moderationQuery.data?.totalPages ?? 1);
  const rows = moderationQuery.data?.data ?? [];
  const total = moderationQuery.data?.total ?? 0;

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const isInitialLoading = moderationQuery.isLoading && rows.length === 0;
  const errorMessage =
    moderationQuery.error instanceof Error
      ? moderationQuery.error.message
      : 'Không thể tải lịch sử kiểm duyệt.';

  const activeTargetTypeLabel =
    targetType === 'all' ? 'Tất cả' : getTargetLabel(targetType);

  return (
    <div className="relative min-h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.18),transparent_65%)] dark:bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.16),transparent_68%)]" />
      <div className="pointer-events-none absolute -left-20 top-16 h-56 w-56 rounded-full bg-sky-200/30 blur-3xl dark:bg-sky-500/10" />
      <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-cyan-200/20 blur-3xl dark:bg-cyan-500/10" />

      <div className="relative space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-sky-600 dark:text-slate-50">
              Lịch sử kiểm duyệt
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Xem lại các bản ghi kiểm duyệt của tài khoản hiện tại với bố cục
              dễ scan, filter rõ hơn và chi tiết nhất quán giữa các trạng thái.
            </p>
          </div>

          <Button
            variant="outline"
            className="h-10 rounded-xl border-slate-200/80 bg-white/80 px-4 text-slate-700 shadow-sm hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-sky-300"
            onClick={() => void moderationQuery.refetch()}
          >
            <RefreshCcw
              className={[
                'mr-2 h-4 w-4',
                moderationQuery.isFetching ? 'animate-spin' : '',
              ].join(' ')}
            />
            Làm mới
          </Button>
        </div>

        <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/70 bg-sky-50/80 px-3 py-1 text-xs font-medium text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Bộ lọc
              </div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Tinh chỉnh kết quả
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Chọn loại bản ghi và số lượng hiển thị để kiểm tra nhanh hơn.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-slate-200/80 bg-white/80 text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300"
              >
                {activeTargetTypeLabel}
              </Badge>
              <Badge className="border-sky-200/70 bg-sky-50/80 text-sky-700 hover:bg-sky-50 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300">
                {total} bản ghi
              </Badge>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Loại nội dung
              </label>
              <Select
                value={targetType}
                onValueChange={(value) => {
                  setTargetType(value as (typeof TARGET_TYPE_OPTIONS)[number]);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-slate-200/80 bg-slate-50/80 text-slate-700 shadow-none backdrop-blur dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value={TargetType.POST}>Bài viết</SelectItem>
                  <SelectItem value={TargetType.COMMENT}>Bình luận</SelectItem>
                  <SelectItem value={TargetType.SHARE}>Chia sẻ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Số bản ghi mỗi trang
              </label>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(
                    Number(value) as (typeof PAGE_SIZE_OPTIONS)[number],
                  );
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-slate-200/80 bg-slate-50/80 text-slate-700 shadow-none backdrop-blur dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <Card className="overflow-hidden rounded-3xl border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
          <CardHeader className="border-b border-slate-200/70 bg-linear-to-r from-sky-50/80 via-white to-slate-50/80 px-4 py-4 dark:border-slate-800 dark:from-sky-950/20 dark:via-slate-950 dark:to-slate-900/70 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle className="text-lg tracking-tight text-slate-900 dark:text-slate-100">
                  Bản ghi kiểm duyệt
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  {total > 0
                    ? `Tổng ${total} bản ghi · Trang ${page} / ${totalPages}`
                    : 'Không có bản ghi nào trong tài khoản hiện tại'}
                </CardDescription>
              </div>

              <div className="text-sm text-slate-500 dark:text-slate-400">
                Chế độ xem hiện tại:{' '}
                <span className="text-slate-700 dark:text-slate-200">
                  {activeTargetTypeLabel}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 pb-3 sm:p-6 sm:pb-4">
            {moderationQuery.isError ? (
              <ErrorFallback message={errorMessage} />
            ) : isInitialLoading ? (
              <ModerationSkeletonList />
            ) : rows.length === 0 ? (
              <EmptyModerationState />
            ) : (
              <div className="space-y-2.5 sm:space-y-3">
                {rows.map((item) => (
                  <ModerationHistoryItem
                    key={item.id}
                    item={item}
                    onOpenDetail={() => {
                      setSelectedModerationId(item.id);
                      setDetailOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-slate-200/70 px-4 py-4 dark:border-slate-800 sm:px-6">
            <ModerationHistoryPagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
            />
          </CardFooter>
        </Card>

        <ModerationDetailSheet
          moderationId={selectedModerationId}
          open={detailOpen}
          onOpenChange={(nextOpen) => {
            setDetailOpen(nextOpen);

            if (!nextOpen) {
              setSelectedModerationId(null);
            }
          }}
        />
      </div>
    </div>
  );
}
