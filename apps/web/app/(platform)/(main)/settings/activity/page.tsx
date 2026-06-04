'use client';

import * as React from 'react';
import { format } from 'date-fns';
import {
  Activity,
  ArrowRight,
  CalendarRange,
  Clock3,
  RefreshCw,
  Sparkles,
  Tag,
  Target,
} from 'lucide-react';

import {
  ActivityType,
  useUserActivity,
  type UserActivityDto,
  type UserActivityLogFilter,
} from '@repo/shared';

import { ErrorFallback } from '@/components/error-fallback';
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
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_LIMIT = 12;
const ALL_ACTIVITY_TYPE = 'all';

type ActivityFilterState = {
  activityType: ActivityType | typeof ALL_ACTIVITY_TYPE;
  fromDate: string;
  toDate: string;
};

const activityTypeLabels: Record<ActivityType, string> = {
  [ActivityType.POST_CREATED]: 'Tạo bài viết',
  [ActivityType.COMMENT_CREATED]: 'Tạo bình luận',
  [ActivityType.POST_SHARED]: 'Chia sẻ bài viết',
  [ActivityType.SEND_REQUEST]: 'Gửi lời mời kết bạn',
  [ActivityType.ACCEPT_REQUEST]: 'Chấp nhận lời mời',
  [ActivityType.REJECT_REQUEST]: 'Từ chối lời mời',
  [ActivityType.CANCEL_REQUEST]: 'Hủy lời mời',
  [ActivityType.UNFRIEND]: 'Hủy kết bạn',
  [ActivityType.USER_BLOCKED]: 'Chặn người dùng',
  [ActivityType.GROUP_JOINED]: 'Tham gia nhóm',
  [ActivityType.GROUP_LEFT]: 'Rời nhóm',
  [ActivityType.GROUP_CREATED]: 'Tạo nhóm',
};

const activityTypeOptions = Object.values(ActivityType);

const formatDateTime = (value?: Date | string) => {
  if (!value) return 'Không rõ thời gian';

  return format(new Date(value), 'dd/MM/yyyy HH:mm');
};

const formatLabel = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/^[a-zÀ-ỹ]/, (match) => match.toUpperCase());

const getActivityTypeLabel = (value: string) => {
  if (value in activityTypeLabels) {
    return activityTypeLabels[value as ActivityType];
  }

  return formatLabel(value);
};

const renderMetadataValue = (value: unknown) => {
  if (value === null || value === undefined) return null;

  if (typeof value === 'string') return value;

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
};

const getActivityIcon = (type: string) => {
  const normalized = type.toLowerCase();

  if (normalized.includes('create') || normalized.includes('post')) {
    return Sparkles;
  }

  if (normalized.includes('target') || normalized.includes('view')) {
    return Target;
  }

  if (normalized.includes('tag') || normalized.includes('metadata')) {
    return Tag;
  }

  return Activity;
};

function ActivityTimelineItem({ item }: { item: UserActivityDto }) {
  const Icon = getActivityIcon(item.activityType);

  const metadataEntries = Object.entries(item.metadata ?? {})
    .map(([key, value]) => {
      const normalized = renderMetadataValue(value);

      return normalized ? { key, value: normalized } : null;
    })
    .filter(
      (
        entry,
      ): entry is {
        key: string;
        value: string;
      } => entry !== null,
    )
    .slice(0, 3);

  return (
    <div className="group relative flex gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 transition-all hover:border-sky-200 hover:shadow-sm">
      <div className="relative flex flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-100 bg-sky-50 text-sky-600">
          <Icon className="h-4 w-4" />
        </div>

        <div className="mt-2 h-full w-px flex-1 bg-slate-200 group-last:hidden" />
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-full bg-sky-50 text-sky-700 hover:bg-sky-50"
              >
                {getActivityTypeLabel(item.activityType)}
              </Badge>

              {item.targetId ? (
                <Badge
                  variant="outline"
                  className="rounded-full text-slate-500"
                >
                  {item.targetId.slice(0, 12)}
                </Badge>
              ) : null}
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-900">
                {item.contentPreview || 'Hoạt động hệ thống'}
              </h3>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <Clock3 className="h-3.5 w-3.5" />
                {formatDateTime(item.createdAt)}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400">#{item.id.slice(0, 8)}</div>
        </div>

        {metadataEntries.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {metadataEntries.map((entry) => (
              <div
                key={entry.key}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
              >
                <span className="font-medium text-slate-700">
                  {formatLabel(entry.key)}:
                </span>{' '}
                {entry.value}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ActivitySkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex gap-4 rounded-2xl border border-slate-200/70 bg-white p-4"
        >
          <Skeleton className="h-10 w-10 rounded-full" />

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40 rounded-full" />
                <Skeleton className="h-4 w-64 max-w-full" />
              </div>

              <Skeleton className="h-4 w-16" />
            </div>

            <Skeleton className="h-8 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyActivityState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Activity className="h-6 w-6" />
      </div>

      <h2 className="mt-4 text-base font-semibold text-slate-900">
        Chưa có nhật ký hoạt động
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Các hoạt động gần đây của tài khoản sẽ xuất hiện tại đây khi có dữ liệu
        mới.
      </p>
    </div>
  );
}

export default function SettingsActivityPage() {
  const [filters, setFilters] = React.useState<ActivityFilterState>({
    activityType: ALL_ACTIVITY_TYPE,
    fromDate: '',
    toDate: '',
  });

  const queryFilters = React.useMemo<UserActivityLogFilter>(
    () => ({
      limit: PAGE_LIMIT,
      activityType:
        filters.activityType === ALL_ACTIVITY_TYPE
          ? undefined
          : filters.activityType,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
    }),
    [filters],
  );

  const activityQuery = useUserActivity(queryFilters);

  const activities = React.useMemo(() => {
    const items = activityQuery.data?.pages.flatMap((page) => page.data) ?? [];

    return [...items].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    );
  }, [activityQuery.data?.pages]);

  const isInitialLoading = activityQuery.isLoading && activities.length === 0;

  const errorMessage =
    activityQuery.error instanceof Error
      ? activityQuery.error.message
      : 'Không thể tải nhật ký hoạt động.';

  const hasAppliedFilters = Boolean(
    filters.activityType !== ALL_ACTIVITY_TYPE ||
    filters.fromDate ||
    filters.toDate,
  );

  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);

  const applyQuickDateRange = React.useCallback((days: number) => {
    const endDate = new Date();
    const startDate = new Date();

    startDate.setDate(endDate.getDate() - (days - 1));

    setFilters((current) => ({
      ...current,
      fromDate: startDate.toISOString().slice(0, 10),
      toDate: endDate.toISOString().slice(0, 10),
    }));
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-sky-600">
            Nhật ký hoạt động
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Theo dõi các thao tác gần đây của tài khoản hiện tại.
          </p>
        </div>

        <Button
          variant="outline"
          className="border-slate-200 bg-white hover:bg-slate-50"
          onClick={() => void activityQuery.refetch()}
        >
          {activityQuery.isFetching ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Làm mới
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-sky-100/80 bg-gradient-to-br from-sky-50 via-white to-indigo-50/40 p-4 shadow-sm sm:p-5">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-10 top-0 h-32 w-32 rounded-full bg-sky-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-indigo-200/20 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
            <div className="grid flex-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500">
                  Loại hoạt động
                </label>

                <Select
                  value={filters.activityType}
                  onValueChange={(value) =>
                    setFilters((current) => ({
                      ...current,
                      activityType:
                        value as ActivityFilterState['activityType'],
                    }))
                  }
                >
                  <SelectTrigger className="h-11 border-slate-200">
                    <SelectValue placeholder="Chọn loại hoạt động" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={ALL_ACTIVITY_TYPE}>Tất cả</SelectItem>

                    {activityTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {activityTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500">
                  Từ ngày
                </label>

                <Input
                  type="date"
                  lang="vi"
                  max={filters.toDate || today}
                  value={filters.fromDate}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      fromDate: event.target.value,
                    }))
                  }
                  className="h-11 border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500">
                  Đến ngày
                </label>

                <Input
                  type="date"
                  lang="vi"
                  min={filters.fromDate || undefined}
                  value={filters.toDate}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      toDate: event.target.value,
                    }))
                  }
                  className="h-11 border-slate-200"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-slate-200"
                onClick={() => applyQuickDateRange(7)}
              >
                <CalendarRange className="mr-2 h-4 w-4" />7 ngày
              </Button>

              <Button
                type="button"
                variant="outline"
                className="border-slate-200"
                onClick={() => applyQuickDateRange(30)}
              >
                <CalendarRange className="mr-2 h-4 w-4" />
                30 ngày
              </Button>

              <Button
                variant="outline"
                className="border-slate-200"
                onClick={() =>
                  setFilters({
                    activityType: ALL_ACTIVITY_TYPE,
                    fromDate: '',
                    toDate: '',
                  })
                }
              >
                Xóa lọc
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <Badge
            variant="secondary"
            className="rounded-full bg-slate-100 text-slate-700"
          >
            <ArrowRight className="mr-1 h-3 w-3" />
            Mới nhất trước
          </Badge>

          {hasAppliedFilters ? (
            <Badge
              variant="outline"
              className="rounded-full border-sky-200 text-sky-700"
            >
              Đang lọc
            </Badge>
          ) : null}

          <span className="text-sm text-slate-500">
            {activities.length > 0
              ? `${activities.length} hoạt động`
              : 'Chưa có dữ liệu'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {activityQuery.isError ? (
          <ErrorFallback message={errorMessage} />
        ) : isInitialLoading ? (
          <ActivitySkeletonList />
        ) : activities.length === 0 ? (
          <EmptyActivityState />
        ) : (
          activities.map((item) => (
            <ActivityTimelineItem key={item.id} item={item} />
          ))
        )}
      </div>

      {activityQuery.hasNextPage ? (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            className="min-w-40 border-slate-200 bg-white hover:bg-slate-50"
            onClick={() => void activityQuery.fetchNextPage()}
            disabled={activityQuery.isFetchingNextPage}
          >
            {activityQuery.isFetchingNextPage ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : null}

            {activityQuery.isFetchingNextPage ? 'Đang tải...' : 'Tải thêm'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
