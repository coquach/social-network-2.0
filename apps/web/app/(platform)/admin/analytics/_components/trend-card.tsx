"use client";

import { AreaSparkline } from './chart-primitives';

type TrendPoint = {
  label: string;
  value: number;
};

export function TrendCard({ data }: { data: TrendPoint[] }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Xu hướng báo cáo trong tuần</h2>
          <p className="text-sm text-slate-500">Tổng hợp báo cáo và lượt xử lý mỗi ngày</p>
        </div>
        <div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
          Dữ liệu demo
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-sky-50 bg-gradient-to-b from-sky-50/40 to-white p-4">
        <AreaSparkline data={data} />

        <div className="mt-2 grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-500">
          {data.map((item) => (
            <div key={item.label} className="rounded-full bg-sky-50 py-2 text-slate-600">
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
