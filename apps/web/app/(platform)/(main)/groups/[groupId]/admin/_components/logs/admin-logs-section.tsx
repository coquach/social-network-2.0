'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { useGroupPermissionContext } from '@/contexts/group-permission-context';
import { useGroupLogs } from '@repo/shared';

import { GroupRole } from '@/models/group/enums/group-role.enum';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { GroupEventLog } from '@/models/group/enums/group-envent-log.enum';
import { GroupPermission } from '@/models/group/enums/group-permission.enum';
import { LogRow } from './log-row';

// ===== single source of truth =====
type EventMeta = {
  label: string; // label hiển thị trong dropdown
  badgeLabel: string; // label hiển thị trên badge
  className: string; // style badge
};

export const EVENTS: Record<GroupEventLog, EventMeta> = {
  [GroupEventLog.GROUP_UPDATED]: {
    label: 'Cập nhật nhóm',
    badgeLabel: 'Cập nhật',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  [GroupEventLog.GROUP_SETTING_CHANGED]: {
    label: 'Thay đổi cài đặt nhóm',
    badgeLabel: 'Cài đặt',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  [GroupEventLog.JOIN_REQUEST_APPROVED]: {
    label: 'Duyệt yêu cầu tham gia',
    badgeLabel: 'Duyệt YC',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [GroupEventLog.JOIN_REQUEST_REJECTED]: {
    label: 'Từ chối yêu cầu tham gia',
    badgeLabel: 'Từ chối YC',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  [GroupEventLog.MEMBER_JOINED]: {
    label: 'Thành viên đã tham gia',
    badgeLabel: 'Tham gia',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [GroupEventLog.MEMBER_LEFT]: {
    label: 'Thành viên đã rời nhóm',
    badgeLabel: 'Rời nhóm',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  [GroupEventLog.MEMBER_REMOVED]: {
    label: 'Thành viên bị xóa khỏi nhóm',
    badgeLabel: 'Xóa TV',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  [GroupEventLog.MEMBER_BANNED]: {
    label: 'Thành viên bị chặn',
    badgeLabel: 'Chặn TV',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  [GroupEventLog.MEMBER_UNBANNED]: {
    label: 'Thành viên được bỏ chặn',
    badgeLabel: 'Bỏ chặn',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  [GroupEventLog.POST_APPROVED]: {
    label: 'Bài viết được duyệt',
    badgeLabel: 'Duyệt bài',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  [GroupEventLog.POST_REJECTED]: {
    label: 'Bài viết bị từ chối',
    badgeLabel: 'Từ chối bài',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  [GroupEventLog.MEMBER_ROLE_CHANGED]: {
    label: 'Thay đổi vai trò',
    badgeLabel: 'Vai trò',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  [GroupEventLog.MEMBER_PERMISSION_CHANGED]: {
    label: 'Thay đổi quyền',
    badgeLabel: 'Quyền',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
};

// ===== derived exports (if you still want these names) =====
export const EVENT_LABEL: Record<GroupEventLog, string> = Object.fromEntries(
  Object.entries(EVENTS).map(([k, v]) => [k, v.label])
) as Record<GroupEventLog, string>;

export const EVENT_BADGE: Record<
  GroupEventLog,
  { label: string; className: string }
> = Object.fromEntries(
  Object.entries(EVENTS).map(([k, v]) => [
    k,
    { label: v.badgeLabel, className: v.className },
  ])
) as Record<GroupEventLog, { label: string; className: string }>;

type Props = {
  groupId: string;
};

export const GroupAdminLogsSection = ({ groupId }: Props) => {
  const { role, can } = useGroupPermissionContext();
  const EVENT_OPTIONS = useMemo(
    () => [
      { label: 'Tất cả hoạt động', value: 'ALL' as const },
      ...(Object.entries(EVENTS) as [GroupEventLog, EventMeta][]).map(
        ([value, meta]) => ({ value, label: meta.label })
      ),
    ],
    []
  );
  const [eventFilter, setEventFilter] = useState<'ALL' | GroupEventLog>('ALL');

  const isAdminLike =
    role === GroupRole.OWNER ||
    role === GroupRole.ADMIN ||
    role === GroupRole.MODERATOR;

  const canViewLogs =
    !!groupId && (isAdminLike || can(GroupPermission.VIEW_REPORTS));

  const effectiveGroupId = canViewLogs ? groupId : '';

  const filter = useMemo(
    () => ({
      cursor: undefined,
      eventType: eventFilter === 'ALL' ? undefined : eventFilter,
    }),
    [eventFilter]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useGroupLogs(effectiveGroupId, filter);

  const logs = data?.pages.flatMap((p) => p.data) ?? [];
  const { ref, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!canViewLogs) {
    return (
      <div className="rounded-xl border border-dashed border-sky-300 bg-sky-50 px-4 py-5 text-sm text-sky-800">
        Bạn không có quyền xem nhật ký hoạt động trong nhóm này.
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
        Có lỗi xảy ra khi tải nhật ký hoạt động. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-sky-50 border border-sky-200 shadow-sm rounded-xl px-4 py-3">
        <div>
          <h2 className="text-lg font-bold text-sky-700">Nhật kí hoạt động</h2>
          <p className="text-xs text-sky-600/90">
            Xem lại các hoạt động quản trị trong nhóm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-sky-700 font-medium">Lọc</span>
          <Select
            value={eventFilter}
            onValueChange={(v) => setEventFilter(v as 'ALL' | GroupEventLog)}
          >
            <SelectTrigger className="h-9 w-48 border-sky-400 text-sm focus:ring-sky-500 focus:ring-1">
              <SelectValue placeholder="L�?c hoạt �?�?ng" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-sky-100 bg-white/90">
        {isLoading && (
          <div className="space-y-3 px-4 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-3"
              >
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-64" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && logs.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-50">
              <span className="text-lg">??</span>
            </div>
            <p className="text-sm font-medium text-slate-800">
              Chưa có hoạt động quản trị nào trong nhóm
            </p>
            <p className="text-xs text-slate-500">
              Các hoạt động quản trị như duyệt yêu cầu tham gia, phê duyệt bài
              viết, thay đổi cài đặt nhóm sẽ hiển thị ở đây.
            </p>
          </div>
        )}

        {!isLoading && logs.length > 0 && (
          <div className="divide-y divide-slate-100 px-4 py-3">
            {logs.map((log) => (
              <LogRow key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>

      <div ref={ref} className="h-8 flex items-center justify-center">
        {isFetchingNextPage && (
          <span className="text-xs text-sky-600/80">
            Đang tải thêm nhật ký hoạt động...
          </span>
        )}
        {!hasNextPage && (
          <span className="text-xs text-slate-400">
            Đã tải hết nhật ký hoạt động.
          </span>
        )}
      </div>
    </div>
  );
};
