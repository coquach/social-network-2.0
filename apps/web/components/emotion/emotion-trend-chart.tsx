import { format } from 'date-fns';
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis
} from 'recharts';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { feelingsUI } from '@/lib/types/feeling';

export type EmotionTrendPoint = {
  date: string | Date;
} & Record<string, number | string | Date>;

const EMOTION_COLOR_MAP: Record<string, string> = {
  'text-amber-500': '#f59e0b',
  'text-sky-500': '#0ea5e9',
  'text-orange-500': '#f97316',
  'text-violet-500': '#8b5cf6',
  'text-emerald-500': '#10b981',
  'text-rose-500': '#f43f5e',
  'text-slate-500': '#64748b',
};

const chartConfig: ChartConfig = feelingsUI.reduce((acc, feeling, idx) => {
  const fallback = `hsl(var(--chart-${(idx % 6) + 1}))`;
  const resolvedColor = EMOTION_COLOR_MAP[feeling.color] ?? fallback;
  const key = feeling.type.toLowerCase();
  acc[key] = {
    label: `${feeling.emoji} ${feeling.name}`,
    color: resolvedColor,
  };
  return acc;
}, {} as ChartConfig);

export function EmotionTrendChart({
  data,
  loading,
  emptyText = 'Chưa có dữ liệu cảm xúc trong khoảng thời gian này.',
  legendPosition = 'bottom',
}: {
  data?: EmotionTrendPoint[];
  loading: boolean;
  emptyText?: string;
  className?: string;
  legendPosition?: 'top' | 'bottom';
  variant?: 'area' | 'line';
}) {
  const chartData =
    data?.map((item) => ({
      ...item,
      dateLabel: format(new Date(item.date), 'dd/MM'),
    })) ?? [];

  const emotionKeys = Object.keys(chartConfig) as (keyof typeof chartConfig)[];
  const hasData = chartData.some((row) =>
    emotionKeys.some(
      (k) => k in row && Number((row as Record<string, any>)[k]) > 0
    )
  );

  if (loading) {
    return <Skeleton className="h-56 w-full rounded-xl" />;
  }

  if (!hasData || !data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
      <LineChart data={chartData} margin={{ left: -12, right: 12, top: 8 }}>
        <CartesianGrid strokeDasharray="4 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="dateLabel"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend
          verticalAlign={legendPosition}
          content={<ChartLegendContent />}
        />
        {emotionKeys.map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={String(chartConfig[key].label)}
            stroke={`var(--color-${key})`}
            strokeWidth={2.4}
            dot={{ r: 3 }}
            activeDot={{ r: 4 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
