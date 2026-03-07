'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { useGroupMembers } from '@repo/shared';
import { GroupMemberStatus } from '@/models/group/enums/group-member-status.enum';
import { GroupRole } from '@/models/group/enums/group-role.enum';
import { GroupMemberDTO } from '@/models/group/groupMemberDTO';

import { Skeleton } from '@/components/ui/skeleton';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GroupAdminMemberRow } from './member-row';


type Props = {
  groupId: string;
};

const STATUS_OPTIONS: { value: GroupMemberStatus; label: string }[] = [
  { value: GroupMemberStatus.ACTIVE, label: 'Đang hoạt động' },
  { value: GroupMemberStatus.BANNED, label: 'Đã chặn' },
];

export const roleLabel: Record<GroupRole, string> = {
  OWNER: 'Chủ nhóm',
  ADMIN: 'Quản trị viên',
  MODERATOR: 'Người kiểm duyệt',
  MEMBER: 'Thành viên',
};

const roleOrder: GroupRole[] = [
  GroupRole.OWNER,
  GroupRole.ADMIN,
  GroupRole.MODERATOR,
  GroupRole.MEMBER,
];

export const GroupAdminMembersSection = ({ groupId }: Props) => {
  const [status, setStatus] = useState<GroupMemberStatus>(
    GroupMemberStatus.ACTIVE
  );

  const {
    data,
    status: queryStatus,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGroupMembers(groupId, {
    status,
    limit: 20,
  });

  const { ref, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allMembers: GroupMemberDTO[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((p) => p.data ?? []);
  }, [data]);

  const groupedByRole = useMemo(() => {
    return allMembers.reduce<Partial<Record<GroupRole, GroupMemberDTO[]>>>(
      (acc, m) => {
        (acc[m.role] ??= []).push(m);
        return acc;
      },
      {}
    );
  }, [allMembers]);

  if (isLoading || queryStatus === 'pending') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-40" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border p-3 space-y-2 bg-white">
            <Skeleton className="h-4 w-36" />
            {[...Array(3)].map((__, j) => (
              <div
                key={j}
                className="flex items-center justify-between gap-3 rounded-md border p-2"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-red-500">
        Không thể tải danh sách thành viên.
        {error instanceof Error && (
          <>
            <br />
            {error.message}
          </>
        )}
      </div>
    );
  }

  const total = allMembers.length;

  return (
    <div className="space-y-4">
      {/* Header + filter status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-sky-700">Quản lý thành viên</h2>
          <p className="text-xs text-sky-600/90">
            Tổng cộng <b>{total}</b> thành viên (
            {STATUS_OPTIONS.find((s) => s.value === status)?.label})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-sky-700 font-medium">Trạng thái:</span>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as GroupMemberStatus)}
          >
            <SelectTrigger className="h-9 w-48 border-sky-400 text-sm focus:ring-sky-500 focus:ring-1">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bảng nhóm theo role */}
      {roleOrder.map((role) => {
        const members = groupedByRole[role];
        if (!members || members.length === 0) return null;

        return (
          <section key={role} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-slate-900">
                {roleLabel[role]}{' '}
                <span className="text-xs text-sky-600">
                  ({members.length} người)
                </span>
              </h3>
            </div>

            <div className="space-y-1.5">
              {members.map((m) => (
                <GroupAdminMemberRow key={m.id} member={m} groupId={groupId} />
              ))}
            </div>
          </section>
        );
      })}

      {/* sentinel infinite scroll */}
      <div ref={ref} className="h-8 flex items-center justify-center">
        {isFetchingNextPage && (
          <span className="text-xs text-sky-600/80">
            Đang tải thêm thành viên...
          </span>
        )}
        {!hasNextPage && total > 0 && (
          <span className="text-xs text-slate-400">
            Đã hiển thị tất cả thành viên.
          </span>
        )}
      </div>
    </div>
  );
};
