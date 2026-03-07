"use client";

import { StackedColumns } from './chart-primitives';

type ActivityPoint = {
  label: string;
  resolved: number;
  flagged: number;
  newReports: number;
};

export function ActivityBars({ data }: { data: ActivityPoint[] }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Thống kê xử lý hàng ngày
          </h2>
          <p className="text-sm text-slate-500">
            So sánh số lượng đã xử lý, báo cáo mới và cần ưu tiên
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Đã xử
            lý
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-rose-700">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Cần ưu
            tiên
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-1 text-sky-700">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Báo cáo mới
          </span>
        </div>
      </div>

      <StackedColumns
        data={data.map((day) => ({
          label: day.label,
          segments: [
            { key: 'resolved', value: day.resolved, color: 'bg-emerald-400' },
            { key: 'flagged', value: day.flagged, color: 'bg-rose-400' },
            { key: 'newReports', value: day.newReports, color: 'bg-sky-400' },
          ],
        }))}
      />
    </div>
  );
}
