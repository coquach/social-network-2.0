'use client';

import { format } from 'date-fns';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

type ReportChartItem = {
  date: string;
  pendingCount: number;
  resolvedCount: number;
  rejectedCount: number;
};

const COLORS = {
  resolved: '#10b981',
  pending: '#38bdf8',
  rejected: '#f97316',
};

const chartConfig = {
  resolved: { label: 'Đã xử lý', color: COLORS.resolved },
  pending: { label: 'Chờ', color: COLORS.pending },
  rejected: { label: 'Bỏ qua', color: COLORS.rejected },
} satisfies ChartConfig;

export function ReportStatusChart({ data, loading }: { data?: ReportChartItem[]; loading: boolean }) {
  const chartData =
    data?.map((item) => ({
      date: format(new Date(item.date), 'dd/MM'),
      pending: item.pendingCount,
      resolved: item.resolvedCount,
      rejected: item.rejectedCount,
    })) ?? [];

  const hasData = chartData.some((d) => d.pending || d.resolved || d.rejected);

  if (loading) {
    return <Skeleton className="h-56 w-full rounded-xl" />;
  }

  if (!hasData) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
        Không có báo cáo nào trong khoảng thời gian này.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
      <BarChart data={chartData} margin={{ left: -16, right: 12, top: 8 }} barSize={36}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend verticalAlign="bottom" content={<ChartLegendContent />} />
        <Bar dataKey="resolved" stackId="status" fill={COLORS.resolved} radius={[4, 4, 0, 0]} />
        <Bar dataKey="pending" stackId="status" fill={COLORS.pending} radius={[4, 4, 0, 0]} />
        <Bar dataKey="rejected" stackId="status" fill={COLORS.rejected} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
