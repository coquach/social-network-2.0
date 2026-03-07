'use client';

import { format } from 'date-fns';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

type ContentChartItem = {
  date: string;
  postCount: number;
  commentCount: number;
  shareCount: number;
};

const chartConfig = {
  posts: { label: 'Bài viết', color: '#3b82f6' },
  comments: { label: 'Bình luận', color: '#f97316' },
  shares: { label: 'Chia sẻ', color: '#10b981' },
} satisfies ChartConfig;

export function ContentPerformanceChart({ data, loading }: { data?: ContentChartItem[]; loading: boolean }) {
  const chartData =
    data?.map((item) => ({
      date: format(new Date(item.date), 'dd/MM'),
      posts: Number(item.postCount ?? 0),
      comments: Number(item.commentCount ?? 0),
      shares: Number(item.shareCount ?? 0),
    })) ?? [];

  const hasData = chartData.some((d) => d.posts > 0 || d.comments > 0 || d.shares > 0);

  if (loading) {
    return <Skeleton className="h-56 w-full rounded-xl" />;
  }

  if (!hasData) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
        Không có dữ liệu nội dung trong khoảng thời gian này.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
      <LineChart data={chartData} margin={{ left: -12, right: 12, top: 8 }}>
        <CartesianGrid strokeDasharray="4 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} domain={[0, 'dataMax + 2']} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend verticalAlign="bottom" content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="posts"
          stroke="var(--color-posts)"
          strokeWidth={2.4}
          dot={{ r: 3 }}
          activeDot={{ r: 4 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="comments"
          stroke="var(--color-comments)"
          strokeWidth={2.4}
          dot={{ r: 3 }}
          activeDot={{ r: 4 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="shares"
          stroke="var(--color-shares)"
          strokeWidth={2.4}
          dot={{ r: 3 }}
          activeDot={{ r: 4 }}
          connectNulls
        />
      </LineChart>
    </ChartContainer>
  );
}
