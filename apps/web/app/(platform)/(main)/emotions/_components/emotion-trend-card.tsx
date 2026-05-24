'use client';

import { format } from 'date-fns';
import { useId, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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

import { EmotionTrendWindow, useEmotionDashboardTrend } from '@repo/shared';

import { formatPercentage, formatWindowLabel } from '../lib/emotion-formatters';

const WINDOW_OPTIONS: EmotionTrendWindow[] = ['1d', '7d', '30d'];

const StatBlock = ({
  label,
  value,
  helper,
  emphasized = false,
}: {
  label: string;
  value: string;
  helper?: string;
  emphasized?: boolean;
}) => (
  <div
    className={[
      'rounded-3xl border px-4 py-3 transition-all',
      emphasized
        ? 'border-sky-200 bg-sky-50/70'
        : 'border-slate-200/80 bg-slate-50/70',
    ].join(' ')}
  >
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </p>

    <p
      className={[
        'mt-1 font-semibold tracking-tight',
        emphasized ? 'text-3xl text-slate-950' : 'text-xl text-slate-900',
      ].join(' ')}
    >
      {value}
    </p>

    {helper ? (
      <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>
    ) : null}
  </div>
);

const getTrendSignal = (delta: number) => {
  const abs = Math.abs(delta);

  if (abs < 0.03) {
    return {
      direction: 'neutral',
      label: 'Ổn định',
      description: 'Trạng thái cảm xúc không thay đổi đáng kể.',
    };
  }

  if (delta > 0) {
    if (abs < 0.1) {
      return {
        direction: 'up',
        label: 'Tăng nhẹ',
        description: 'Mức tiêu cực đang tăng nhẹ.',
      };
    }

    if (abs < 0.2) {
      return {
        direction: 'up',
        label: 'Tăng rõ rệt',
        description: 'Cảm xúc tiêu cực tăng đáng chú ý.',
      };
    }

    return {
      direction: 'up',
      label: 'Tăng mạnh',
      description: 'Áp lực cảm xúc đang tăng cao.',
    };
  }

  if (abs < 0.1) {
    return {
      direction: 'down',
      label: 'Cải thiện nhẹ',
      description: 'Trạng thái đang tích cực hơn.',
    };
  }

  return {
    direction: 'down',
    label: 'Cải thiện rõ rệt',
    description: 'Mức tiêu cực đã giảm đáng kể.',
  };
};

const formatDelta = (value: number) => {
  const percentage = Math.abs(value * 100).toFixed(1);

  if (value > 0) return `+${percentage} điểm`;
  if (value < 0) return `-${percentage} điểm`;

  return '0 điểm';
};

export const EmotionTrendCard = () => {
  const [window, setWindow] = useState<EmotionTrendWindow>('7d');

  const gradientId = useId();

  const trendQuery = useEmotionDashboardTrend({ window });

  const chartData = useMemo(
    () =>
      trendQuery.data?.data.map((item) => ({
        timestamp: new Date(item.timestamp),
        negativeRatio: item.negativeRatio * 100,
      })) ?? [],
    [trendQuery.data],
  );

  if (trendQuery.isLoading) {
    return (
      <Card className="rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.55)] backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr]">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-3xl" />
            ))}
          </div>

          <Skeleton className="h-[340px] w-full rounded-3xl" />
        </CardContent>
      </Card>
    );
  }

  if (trendQuery.isError) {
    return (
      <Card className="rounded-[28px] border border-rose-200 bg-rose-50/70 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.55)]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold text-rose-700">
            Xu hướng cảm xúc
          </CardTitle>

          <p className="text-sm text-rose-700/80">
            Không thể tải dữ liệu xu hướng ở thời điểm này.
          </p>
        </CardHeader>

        <CardContent>
          <Button
            variant="outline"
            className="border-rose-200 bg-white text-rose-700 hover:bg-rose-100"
            onClick={() => trendQuery.refetch()}
          >
            Tải lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!trendQuery.data || chartData.length === 0) {
    return (
      <Card className="rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.55)] backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Xu hướng cảm xúc
          </CardTitle>

          <p className="text-sm text-slate-600">
            Chưa có đủ dữ liệu cho mốc {formatWindowLabel(window)}.
          </p>
        </CardHeader>

        <CardContent className="flex min-h-[320px] items-center justify-center">
          <div className="max-w-md rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-8 text-center">
            <p className="text-base font-semibold text-slate-900">
              Biểu đồ sẽ rõ hơn khi có thêm dữ liệu.
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Hệ thống cần thêm các lần ghi nhận cảm xúc để tạo xu hướng đáng
              tin cậy.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const current = trendQuery.data.current;
  const previous = trendQuery.data.previous;
  const trend = trendQuery.data.trend;
  const baseline = trendQuery.data.baseline;

  const baselineDelta = current - baseline;

  const trendSignal = getTrendSignal(trend);

  const TrendIcon =
    trendSignal.direction === 'up'
      ? TrendingUp
      : trendSignal.direction === 'down'
        ? TrendingDown
        : Minus;

  const ComparisonIcon =
    baselineDelta > 0
      ? ArrowUpRight
      : baselineDelta < 0
        ? ArrowDownRight
        : Minus;

  const baselineInsight =
    Math.abs(baselineDelta) < 0.03
      ? 'Trạng thái hiện tại gần với mức thông thường.'
      : baselineDelta > 0
        ? `Hiện tại cao hơn mức thông thường ${Math.abs(
            baselineDelta * 100,
          ).toFixed(1)} điểm.`
        : `Hiện tại thấp hơn mức thông thường ${Math.abs(
            baselineDelta * 100,
          ).toFixed(1)} điểm.`;

  return (
    <Card className="rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.55)] backdrop-blur-sm">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Xu hướng cảm xúc
            </CardTitle>

            <p className="text-sm leading-6 text-slate-600">
              Theo dõi biến động cảm xúc tiêu cực trong{' '}
              {formatWindowLabel(window)}.
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

        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr]">
          <StatBlock
            emphasized
            label="Hiện tại"
            value={formatPercentage(current, {
              source: 'ratio',
            })}
            helper="Tỷ lệ cảm xúc tiêu cực hiện tại."
          />

          <StatBlock
            label="Kỳ trước"
            value={formatPercentage(previous, {
              source: 'ratio',
            })}
            helper="Snapshot gần nhất trước đó."
          />

          <StatBlock
            label="Chênh lệch"
            value={formatDelta(trend)}
            helper="Mức thay đổi so với kỳ trước."
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm">
              <TrendIcon className="h-4 w-4" />
              {trendSignal.label}
            </span>

            <span className="text-sm text-slate-600">
              {trendSignal.description}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm">
              <ComparisonIcon className="h-3.5 w-3.5" />
              Trung bình cá nhân:{' '}
              {formatPercentage(baseline, {
                source: 'ratio',
              })}
            </span>

            <span className="text-slate-500">{baselineInsight}</span>
          </div>
        </div>

        <div className="h-[340px] w-full rounded-[24px] border border-slate-100 bg-white p-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                left: -8,
                right: 12,
                top: 12,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id={`${gradientId}-trend`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />

                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <ReferenceArea
                y1={baseline * 100 - 5}
                y2={baseline * 100 + 5}
                fill="#0ea5e9"
                fillOpacity={0.05}
              />

              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

              <XAxis
                dataKey="timestamp"
                minTickGap={16}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="#64748b"
                tickFormatter={(value) =>
                  format(new Date(value), window === '1d' ? 'HH:mm' : 'MMM d')
                }
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                width={42}
                stroke="#64748b"
                tickFormatter={(value) => `${value}%`}
              />

              <Tooltip
                cursor={{
                  stroke: '#bae6fd',
                  strokeWidth: 1,
                }}
                labelFormatter={(value) =>
                  format(
                    new Date(value),
                    window === '1d' ? 'HH:mm, MMM d' : 'MMM d, yyyy',
                  )
                }
                formatter={(value) => [
                  `${Number(value).toFixed(1)}%`,
                  'Mức tiêu cực',
                ]}
              />

              <Area
                type="monotone"
                dataKey="negativeRatio"
                fill={`url(#${gradientId}-trend)`}
                stroke="none"
              />

              <Line
                type="monotone"
                dataKey="negativeRatio"
                name="Mức tiêu cực"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{
                  r: 3,
                  strokeWidth: 2,
                  fill: '#ffffff',
                }}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                  fill: '#ffffff',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
