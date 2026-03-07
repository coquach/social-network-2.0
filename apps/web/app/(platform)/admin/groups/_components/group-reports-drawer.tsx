'use client';

import React from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

import {
  useGroupReports,
  useGroupModeration,
  useIgnoreGroupReports,
} from '@/hooks/use-admin-group';
import { GroupStatus } from '@/models/group/enums/group-status.enum';
import { ReportStatus } from '@/models/report/reportDTO';
import { AdminReportCard } from '../../_components/admin-report-card';

type GroupReportsDrawerProps = {
  groupId?: string;
  groupName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GroupReportsDrawer({
  groupId,
  groupName,
  open,
  onOpenChange,
}: GroupReportsDrawerProps) {
  const [statusFilter, setStatusFilter] = React.useState<ReportStatus | 'all'>('all');
  const { banMutation, updateStatusLocally } = useGroupModeration();
  const ignoreMutation = useIgnoreGroupReports();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useGroupReports(groupId, {
    limit: 5,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const reports = React.useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );
  const hasPendingReports = reports.some((report) => report.status === ReportStatus.PENDING);

  const handleBanGroup = async () => {
    if (!groupId) return;
    updateStatusLocally(groupId, GroupStatus.BANNED); // keep UI responsive
    await banMutation.mutateAsync(groupId);
    onOpenChange(false);
  };

  const handleIgnore = async () => {
    if (!groupId) return;
    await ignoreMutation.mutateAsync(groupId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] border-sky-100 overflow-hidden p-0">
        <DialogHeader className="space-y-1 p-4">
          <DialogTitle className="text-sky-600">Báo cáo nhóm</DialogTitle>
          <DialogDescription>
            Danh sách báo cáo liên quan đến {groupName ?? 'nhóm'}
          </DialogDescription>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ReportStatus | 'all')}
          >
            <SelectTrigger className="h-9 w-[140px] border-sky-100 text-sm mr-5">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={ReportStatus.PENDING}>Chờ</SelectItem>
              <SelectItem value={ReportStatus.RESOLVED}>Đã xử lý</SelectItem>
              <SelectItem value={ReportStatus.REJECTED}>Bỏ qua</SelectItem>
            </SelectContent>
          </Select>
        </DialogHeader>

        <div className="space-y-3 px-4">
          {isLoading ? (
            <div className="flex items-center justify-center rounded-xl border border-slate-100 bg-white p-6 text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải...
            </div>
          ) : null}

          {!isLoading && reports.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center text-sm text-slate-600">
              Không có báo cáo.
            </div>
          ) : null}

          {reports.map((report) => (
            <AdminReportCard key={report.id} report={report} />
          ))}
        </div>


        <DialogFooter  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {groupId && hasPendingReports ? (
            <Button
              variant="outline"
              onClick={handleBanGroup}
              disabled={banMutation.isPending}
              className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
            >
              {banMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="mr-2 h-4 w-4" />
              )}
              Ẩn nhóm
            </Button>
          ) : null}

          <div className="flex items-center gap-2 sm:justify-end">
            {groupId && hasPendingReports ? (
              <Button
                variant="outline"
                onClick={handleIgnore}
                disabled={ignoreMutation.isPending}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                {ignoreMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <X className="mr-2 h-4 w-4" />
                )}
                Bỏ qua báo cáo
              </Button>
            ) : null}

            {hasNextPage ? (
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage || isFetching}
                className="bg-sky-600 text-white hover:bg-sky-700"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Tải thêm
                  </>
                ) : (
                  'Tải thêm'
                )}
              </Button>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

