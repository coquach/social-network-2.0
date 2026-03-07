'use client';

import { Badge } from '@/components/ui/badge';
import { ReportDTO, ReportStatus } from '@/models/report/reportDTO';
import { GroupReportDTO } from '@/models/group/groupReportDTO';
import { formatDateVN } from '@/utils/user.utils';

export type AdminReport = ReportDTO | GroupReportDTO;

type AdminReportCardProps = {
  report: AdminReport;
};

const statusMeta: Record<string, { label: string; className: string }> = {
  [ReportStatus.PENDING]: {
    label: 'Chờ',
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  },
  [ReportStatus.RESOLVED]: {
    label: 'Đã xử lý',
    className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  },
  [ReportStatus.REJECTED]: {
    label: 'Bỏ qua',
    className: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
  },
};

const resolveStatus = (status?: string) => {
  if (!status) return ReportStatus.PENDING;
  if (Object.values(ReportStatus).includes(status as ReportStatus)) return status as ReportStatus;
  return status as ReportStatus;
};

export function AdminReportCard({ report }: AdminReportCardProps) {
  const statusKey = resolveStatus(report.status);
  const meta = statusMeta[statusKey] ?? statusMeta[ReportStatus.PENDING];

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-sky-50 text-sky-700 hover:bg-sky-50">{report.targetType}</Badge>
            <Badge variant="secondary" className={meta.className}>
              {meta.label}
            </Badge>
            <span className="text-xs text-slate-400">#{report.id}</span>
          </div>

          <div className="line-clamp-2 text-sm text-slate-700">{report.reason || 'Không có nội dung'}</div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{formatDateVN(report.createdAt)}</span>
            {report.reporterId ? <span>• Người báo cáo: {report.reporterId}</span> : null}
            {'groupId' in report && report.groupId ? <span>• Nhóm: {report.groupId}</span> : null}
            {'targetId' in report && report.targetId ? <span>• ID: {report.targetId}</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
