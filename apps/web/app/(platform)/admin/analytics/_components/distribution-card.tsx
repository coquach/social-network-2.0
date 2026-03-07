"use client";

import { DonutChart } from './chart-primitives';

type DistributionItem = {
  label: string;
  value: number;
  color: string;
  gradientClass: string;
};

export function DistributionCard({ data }: { data: DistributionItem[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const safeTotal = total || 1;

  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Phân loại nội dung vi phạm</h2>
      <p className="text-sm text-slate-500">Tỷ trọng báo cáo theo nhóm lý do phổ biến</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2 md:items-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-sky-50 to-white" />
          <DonutChart data={data} />
          <div className="absolute flex h-20 w-20 items-center justify-center rounded-full bg-white text-center text-xs font-medium text-slate-700 shadow-sm">
            Tổng
            <br />
            {total} báo cáo
          </div>
        </div>

        <div className="space-y-3">
          {data.map((item) => {
            const percentage = Math.round((item.value / safeTotal) * 100);

            return (
              <div key={item.label} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full bg-linear-to-br ${item.gradientClass}`}
                    />
                    {item.label}
                  </span>
                  <span className="text-slate-500">{percentage}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full bg-linear-to-r ${item.gradientClass}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
