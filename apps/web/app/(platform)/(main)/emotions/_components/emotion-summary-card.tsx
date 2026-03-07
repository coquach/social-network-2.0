import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmotionSummaryDTO } from '@/models/emotion/emotionDTO';
import { format } from 'date-fns';
import { Pie, PieChart, Cell } from 'recharts';
import { EMOTION_KEYS, emotionMeta, getEmotionMeta, pickValue } from './emotion-meta';

interface EmotionSummaryCardProps {
  data?: EmotionSummaryDTO;
  loading: boolean;
  lastUpdated?: Date;
}

const chartConfig = EMOTION_KEYS.reduce(
  (acc, key) => {
    acc[key] = {
      label: `${emotionMeta[key].emoji} ${emotionMeta[key].label}`,
      color: emotionMeta[key].color,
    };
    return acc;
  },
  {} as Record<string, { label: string; color: string }>
);

export const EmotionSummaryCard = ({
  data,
  loading,
  lastUpdated,
}: EmotionSummaryCardProps) => {
  if (loading) {
    return (
      <Card className="h-full border-slate-100 shadow-sm">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="h-full border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-sky-500">
            Tóm tắt cảm xúc
          </CardTitle>
          <p className="text-sm text-slate-500">
            Chưa có dữ liệu để hiển thị. Hãy đăng bài hoặc bình luận để hệ thống
            ghi nhận cảm xúc.
          </p>
        </CardHeader>
      </Card>
    );
  }

  const topEmotionMeta = getEmotionMeta(data.topEmotion as string);
  const total = data.count ?? 0;
  const chartData = EMOTION_KEYS.map((key) => ({
    key,
    value: pickValue(data.distribution, key),
    label: `${emotionMeta[key].emoji} ${emotionMeta[key].label}`,
  }));

  const sum = chartData.reduce((acc, item) => acc + item.value, 0);
  const normalizedData = chartData.map((item) => {
    const value = sum > 1 ? item.value : item.value * 100;
    const percentage = sum > 0 ? (item.value / (sum || 1)) * 100 : 0;
    return { ...item, value, percentage };
  });

  const hasEntries = total > 0 || normalizedData.some((item) => item.value > 0);

  return (
    <Card className="h-full border-slate-100 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-semibold text-sky-500">
          Tóm tắt cảm xúc
        </CardTitle>
        <p className="text-sm text-slate-500">
          Cảm xúc nổi bật và tần suất xuất hiện của bạn.
        </p>
        {lastUpdated && (
          <p className="text-xs text-slate-400">
            Cập nhật: {format(lastUpdated, 'dd/MM/yyyy HH:mm')}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Cảm xúc nổi bật
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
                style={{ backgroundColor: `${topEmotionMeta.color}22` }}
              >
                {topEmotionMeta.emoji}
              </div>
              <div>
                <p className="text-sm text-slate-500">Trạng thái chính</p>
                <p className="text-base font-semibold text-slate-800">
                  {topEmotionMeta.label}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_20px_-14px_rgba(15,23,42,0.35)]">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Số lần ghi nhận
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-800">
              {total.toLocaleString('vi-VN')}
            </p>
            <p className="text-xs text-slate-500">Trong khoảng thời gian đã chọn</p>
          </div>
        </div>

        {hasEntries ? (
          <ChartContainer
            config={chartConfig}
            className="mt-2 flex h-80 flex-col justify-center"
          >
            <PieChart>
              <Pie
                data={normalizedData}
                dataKey="value"
                nameKey="label"
                innerRadius={70}
                outerRadius={120}
                strokeWidth={2}
              >
                {normalizedData.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={`var(--color-${entry.key})`}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(_, name, item) => {
                      const percentage = (item?.payload as any)?.percentage ?? 0;
                      return (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-slate-600">{name}</span>
                          <span className="font-semibold text-slate-800">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
            Chưa có dữ liệu trong khoảng thời gian này.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
