import { useMemo, useState } from 'react';
import { Crown, Sparkles } from 'lucide-react';
import {
  Cell,
  ResponsiveContainer,
  Tooltip,
  Pie,
  PieChart,
  type TooltipProps,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  EmotionTrendWindow,
  useEmotionDashboardDistribution,
} from '@repo/shared';

import { formatPercentage, formatWindowLabel } from '../lib/emotion-formatters';
import {
  EMOTION_ORDER,
  getDistributionCount,
  getEmotionColor,
  getEmotionEmoji,
  getEmotionLabel,
  normalizeEmotionLabel,
} from '../lib/emotion-mappers';

const WINDOW_OPTIONS: EmotionTrendWindow[] = ['1d', '7d', '30d'];

type DistributionRow = {
  emotion: string;
  label: string;
  shortLabel: string;
  emoji: string;
  color: string;
  count: number;
  percent: number;
  dominant: boolean;
};

const DistributionTooltip = ({
  active,
  payload,
}: TooltipProps<number, string>) => {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload as DistributionRow | undefined;

  if (!item) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_18px_32px_-24px_rgba(15,23,42,0.55)]">
      <p className="text-sm font-semibold text-slate-900">
        {item.emoji} {item.shortLabel}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        {item.percent.toFixed(1)}% · {item.count.toLocaleString('vi-VN')} mục
      </p>
    </div>
  );
};

export const EmotionDistributionCard = () => {
  const [window, setWindow] = useState<EmotionTrendWindow>('7d');
  const distributionQuery = useEmotionDashboardDistribution({ window });

  const rows = useMemo(() => {
    const response = distributionQuery.data;
    if (!response) return [];

    const total = EMOTION_ORDER.reduce(
      (sum, emotion) =>
        sum + getDistributionCount(response.distribution, emotion),
      0,
    );

    const dominantEmotion = normalizeEmotionLabel(response.dominantEmotion);

    return EMOTION_ORDER.map((emotion) => {
      const count = getDistributionCount(response.distribution, emotion);
      const percent = total > 0 ? (count / total) * 100 : 0;

      return {
        emotion,
        label: `${getEmotionEmoji(emotion)} ${getEmotionLabel(emotion)}`,
        shortLabel: getEmotionLabel(emotion),
        emoji: getEmotionEmoji(emotion),
        color: getEmotionColor(emotion),
        count,
        percent,
        dominant: dominantEmotion === emotion,
      };
    });
  }, [distributionQuery.data]);

  const visibleRows = rows.filter((row) => row.count > 0);
  const dominant = visibleRows.find((row) => row.dominant) ?? visibleRows[0];
  const dominantLabel = dominant?.shortLabel ?? 'Trung tính';

  if (distributionQuery.isLoading) {
    return (
      <Card className="rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.55)] backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-72 rounded-full" />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            <Skeleton className="h-80 w-full rounded-[28px]" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (distributionQuery.isError) {
    return (
      <Card className="rounded-[28px] border-rose-200 bg-rose-50/70 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.55)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-rose-700">
            Phân bố cảm xúc
          </CardTitle>
          <p className="text-sm text-rose-700/80">
            Không thể tải dữ liệu phân bố ở thời điểm này.
          </p>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="border-rose-200 bg-white text-rose-700 hover:bg-rose-100"
            onClick={() => distributionQuery.refetch()}
          >
            Tải lại phân bố
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!distributionQuery.data || visibleRows.length === 0) {
    return (
      <Card className="rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.55)] backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Phân bố cảm xúc
              </CardTitle>
              <p className="text-sm text-slate-600">
                Chưa có đủ dữ liệu cho mốc {formatWindowLabel(window)}.
              </p>
            </div>
            <Select
              value={window}
              onValueChange={(value) => setWindow(value as EmotionTrendWindow)}
            >
              <SelectTrigger className="w-32 bg-white">
                <SelectValue placeholder="Mốc thời gian" />
              </SelectTrigger>
              <SelectContent>
                {WINDOW_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {formatWindowLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex min-h-70 items-center justify-center">
          <div className="max-w-md rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-8 text-center">
            <p className="text-base font-semibold text-slate-900">
              Chưa đủ dữ liệu để vẽ thành phần cảm xúc.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Khi có thêm hoạt động, biểu đồ donut và insight ưu thế sẽ tự xuất
              hiện ở đây.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.55)] backdrop-blur-sm">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Phân bố cảm xúc
            </CardTitle>
            <p className="text-sm text-slate-600">
              Tỷ trọng từng cảm xúc trong {formatWindowLabel(window)}.
            </p>
          </div>
          <Select
            value={window}
            onValueChange={(value) => setWindow(value as EmotionTrendWindow)}
          >
            <SelectTrigger className="w-32 bg-white">
              <SelectValue placeholder="Mốc thời gian" />
            </SelectTrigger>
            <SelectContent>
              {WINDOW_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {formatWindowLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-700">
          <Sparkles className="h-3.5 w-3.5 text-sky-500" />
          Cảm xúc chiếm ưu thế tuần này là {dominantLabel}.
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-center">
          <div className="relative flex min-h-80 items-center justify-center rounded-[28px] border border-slate-200 bg-slate-50/80 p-4">
            <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),transparent_64%)]" />
            <div className="relative h-70 w-full max-w-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<DistributionTooltip />} />
                  <Pie
                    data={visibleRows}
                    dataKey="count"
                    nameKey="shortLabel"
                    innerRadius={78}
                    outerRadius={112}
                    paddingAngle={3}
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {visibleRows.map((row) => (
                      <Cell key={row.emotion} fill={row.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Cảm xúc nổi bật
                </p>
                <div className="mt-2 flex items-center gap-2 text-slate-900">
                  <span className="text-3xl" aria-hidden>
                    {dominant?.emoji ?? '🙂'}
                  </span>
                  <div>
                    <p className="text-lg font-semibold leading-tight">
                      {dominant?.shortLabel ?? 'Trung tính'}
                    </p>
                    {dominant && (
                      <p className="text-sm text-slate-600">
                        {formatPercentage(dominant.percent, {
                          source: 'percent',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {visibleRows.map((row) => (
              <div
                key={row.emotion}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
                  row.dominant
                    ? 'border-sky-200 bg-sky-50/80 shadow-[0_14px_28px_-22px_rgba(14,165,233,0.4)]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: row.color }}
                  />
                  <p className="text-sm font-semibold text-slate-800">
                    <span className="mr-1" aria-hidden>
                      {row.emoji}
                    </span>
                    {row.shortLabel}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-semibold text-slate-900">
                    {formatPercentage(row.percent, { source: 'percent' })}
                  </span>
                  {row.dominant && (
                    <Badge
                      variant="outline"
                      className="border-sky-200 bg-white text-sky-700"
                    >
                      <Crown className="mr-1 h-3 w-3" /> Nổi bật
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
