'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import {
  useApproveJoinRequest,
  useGroupJoinRequests,
  useRejectJoinRequest,
} from '@repo/shared';



import { useGroupPermissionContext } from '@/contexts/group-permission-context';
import { GroupPermission } from '@/models/group/enums/group-permission.enum';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import { JoinRequestSortBy, JoinRequestStatus } from '@/models/group/enums/group-invite-status.enum';
import { JoinRequestResponseDTO } from '@/models/group/groupRequestDTO';
import { JoinRequestRow } from './join-request-row';

type Props = {
  groupId: string;
};

const STATUS_FILTER_OPTIONS: { value: JoinRequestStatus; label: string }[] = [
  { value: JoinRequestStatus.PENDING, label: 'Đang chờ duyệt' },
  { value: JoinRequestStatus.APPROVED, label: 'Đã chấp nhận' },
  { value: JoinRequestStatus.REJECTED, label: 'Đã từ chối' },
  { value: JoinRequestStatus.CANCELLED, label: 'Đã huỷ' },
];

export const GroupAdminJoinRequestsSection = ({ groupId }: Props) => {
  const { can } = useGroupPermissionContext();
  const canManageJoinRequests = can(GroupPermission.MANAGE_JOIN_REQUESTS);

  // filter gửi lên BE
  const [statusFilter, setStatusFilter] = useState<JoinRequestStatus>(
    JoinRequestStatus.PENDING
  );

  const {
    data,
    status,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGroupJoinRequests(groupId, {
    status: statusFilter,
    sortBy: JoinRequestSortBy.CREATED_AT,
    limit: 20,
  });

  const { ref, inView } = useInView({ threshold: 0 });

  const { mutate: approveMutate, isPending: approving } =
    useApproveJoinRequest();
  const { mutate: rejectMutate, isPending: rejecting } =
    useRejectJoinRequest();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allRequests: JoinRequestResponseDTO[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((p) => p.data ?? []);
  }, [data]);

  if (isLoading || status === 'pending') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-9 w-40" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border p-3 bg-white space-y-3 shadow-sm"
          >
            <Skeleton className="h-4 w-44" />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-red-500">
        Không thể tải danh sách yêu cầu tham gia.
        {error instanceof Error && (
          <>
            <br />
            {error.message}
          </>
        )}
      </div>
    );
  }

  const total = allRequests.length;

  return (
    <div className="space-y-4">
      {/* Header + filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-sky-50 border border-sky-100 rounded-xl px-4 py-3">
        <div>
          <h2 className="text-lg font-bold text-sky-700">Yêu cầu tham gia</h2>
          <p className="text-xs text-sky-600/90">
            Có <b>{total}</b> yêu cầu (
            {STATUS_FILTER_OPTIONS.find((s) => s.value === statusFilter)?.label}
            )
          </p>
          {!canManageJoinRequests && (
            <p className="mt-1 text-[11px] text-amber-600">
              Bạn chỉ có thể xem danh sách, không có quyền xử lý yêu cầu.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-sky-700 font-medium">Trạng thái:</span>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as JoinRequestStatus)}
          >
            <SelectTrigger className="h-9 w-48 border-sky-400 text-sm focus:ring-sky-500 focus:ring-1">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Danh sách yêu cầu */}
      {allRequests.length === 0 && (
        <div className="text-sm text-slate-500 border rounded-lg p-4 bg-slate-50 text-center">
          Không có yêu cầu nào ở trạng thái này.
        </div>
      )}

      <div className="space-y-2">
        {allRequests.map((req) => (
          <JoinRequestRow
            key={req.id}
            request={req}
            canManage={canManageJoinRequests}
            approving={approving}
            rejecting={rejecting}
            onApprove={() => approveMutate({ groupId, requestId: req.id })}
            onReject={() => rejectMutate({ groupId, requestId: req.id })}
          />
        ))}
      </div>

      {/* sentinel infinite scroll */}
      <div ref={ref} className="h-8 flex items-center justify-center">
        {isFetchingNextPage && (
          <span className="text-xs text-sky-600/80">
            Đang tải thêm yêu cầu...
          </span>
        )}
        {!hasNextPage && total > 0 && (
          <span className="text-xs text-slate-400">
            Đã hiển thị tất cả yêu cầu.
          </span>
        )}
      </div>
    </div>
  );
};

