'use client';

import { AlertTriangle, Info, Loader2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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

import { useReportsByTarget } from '@/hooks/use-report-hook';
import { ReportStatus } from '@/models/report/reportDTO';
import { TargetType } from '@/models/social/enums/social.enum';
import { AdminReportCard } from '../../_components/admin-report-card';

type ContentReportsDialogProps = {
  entryId?: string;
  targetType?: TargetType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ContentReportsDialog({
  entryId,
  targetType,
  open,
  onOpenChange,
}: ContentReportsDialogProps) {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    isError,
    refetch,
    resolveTargetMutation,
    ignoreReportMutation,
  } = useReportsByTarget(entryId, targetType, statusFilter);

  const reports = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );
  const hasPendingReports = reports.some(
    (report) => report.status === ReportStatus.PENDING
  );

  const handleResolveTarget = () => {
    if (!entryId || !targetType) return;
    resolveTargetMutation.mutate();
  };

  const handleIgnoreReports = () => {
    if (!entryId || !targetType) return;
    ignoreReportMutation.mutate();
  };

  const canAct = !!entryId && !!targetType;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] border-sky-100 overflow-hidden p-0">
        <DialogHeader className="space-y-1 p-4">
          <DialogTitle className="text-sky-600">Báo cáo</DialogTitle>

          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ReportStatus | 'all')}
          >
            <SelectTrigger className="h-9 w-[140px] border-sky-100 text-sm">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={ReportStatus.PENDING}>Chờ</SelectItem>
              <SelectItem value={ReportStatus.RESOLVED}>Đã xử lý</SelectItem>
              <SelectItem value={ReportStatus.REJECTED}>Bỏ qua</SelectItem>
            </SelectContent>
          </Select>

          {!canAct ? (
            <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <Info className="h-4 w-4" />
              Chưa chọn nội dung.
            </div>
          ) : null}
        </DialogHeader>

        <div className="space-y-3 px-4">
          {isLoading ? (
            <div className="flex items-center justify-center rounded-xl border border-slate-100 bg-white p-6 text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải...
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
              Lỗi tải báo cáo.{' '}
              <button
                className="font-semibold underline"
                onClick={() => refetch()}
              >
                Thử lại
              </button>
            </div>
          ) : null}

          {!isLoading && reports.length === 0 && canAct ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center text-sm text-slate-600">
              Không có báo cáo.
            </div>
          ) : null}

          {reports.map((report) => (
            <AdminReportCard key={report.id} report={report} />
          ))}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {canAct && hasPendingReports ? (
            <Button
              variant="outline"
              onClick={handleResolveTarget}
              disabled={resolveTargetMutation.isPending}
              className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
            >
              {resolveTargetMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="mr-2 h-4 w-4" />
              )}
              Ẩn nội dung
            </Button>
          ) : null}

          <div className="flex items-center gap-2 sm:justify-end">
            {canAct && hasPendingReports ? (
              <Button
                variant="outline"
                onClick={handleIgnoreReports}
                disabled={ignoreReportMutation.isPending}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                {ignoreReportMutation.isPending ? (
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
                disabled={isFetchingNextPage}
                className="bg-sky-600 text-white hover:bg-sky-700"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Tải...
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
