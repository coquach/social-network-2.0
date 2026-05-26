'use client';

import { BadgeCheck, CircleOff, MessagesSquare, Sparkles } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { FeedbackAccuracySummaryDTO } from '@/models/emotion/adminEmotionDTO';

type Props = {
  data?: FeedbackAccuracySummaryDTO;
  loading?: boolean;
};

const summaryMeta = [
  {
    key: 'accuracyRate',
    label: 'Tỷ lệ chính xác',
    icon: Sparkles,
    tone: 'text-sky-600',
    panelClass:
      'border-sky-200 bg-linear-to-br from-sky-100 via-sky-50 to-white',
    highlight: true,
  },
  {
    key: 'accurateCount',
    label: 'Số lượng chính xác',
    icon: BadgeCheck,
    tone: 'text-emerald-600',
    panelClass:
      'border-emerald-200 bg-linear-to-br from-emerald-100 via-emerald-50 to-white',
    highlight: false,
  },
  {
    key: 'inaccurateCount',
    label: 'Số lượng không chính xác',
    icon: CircleOff,
    tone: 'text-rose-600',
    panelClass:
      'border-rose-200 bg-linear-to-br from-rose-100 via-rose-50 to-white',
    highlight: false,
  },
  {
    key: 'totalFeedbacks',
    label: 'Tổng số phản hồi',
    icon: MessagesSquare,
    tone: 'text-slate-600',
    panelClass:
      'border-slate-200 bg-linear-to-br from-slate-100 via-slate-50 to-white',
    highlight: false,
  },
] as const;

const formatNumber = (value?: number) =>
  typeof value === 'number' ? value.toLocaleString('vi-VN') : '0';

const formatAccuracy = (value?: number) => {
  if (typeof value !== 'number') return '0%';
  const normalized = value <= 1 ? value * 100 : value;

  return `${normalized.toFixed(normalized >= 10 ? 0 : 1)}%`;
};

const normalizeAccuracy = (value?: number) => {
  if (typeof value !== 'number') return 0;

  return Math.max(0, Math.min(100, value <= 1 ? value * 100 : value));
};

export function EmotionFeedbackSummary({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryMeta.map((metric) => (
          <Card
            key={metric.key}
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm ${metric.panelClass}`}
          >
            <div className="relative flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-24" />
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 shadow-inner ring-1 ring-white/70">
                <metric.icon className={`h-5 w-5 ${metric.tone}`} />
              </div>
            </div>
            <CardContent className="px-0 pb-0 pt-4">
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summaryMeta.map((metric) => {
        const Icon = metric.icon;

        return (
          <Card
            key={metric.key}
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm ${metric.panelClass}`}
          >
            <div className="absolute inset-0 opacity-95" />

            <CardHeader className="relative flex flex-row items-start justify-between gap-3 pb-0">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-sky-600">
                  {metric.label}
                </div>
                <div
                  className={
                    metric.highlight
                      ? 'text-3xl font-bold tracking-tight text-sky-700'
                      : 'text-3xl font-bold tracking-tight text-slate-900'
                  }
                >
                  {metric.key === 'accuracyRate'
                    ? formatAccuracy(data?.accuracyRate)
                    : formatNumber(
                        data?.[
                          metric.key as keyof FeedbackAccuracySummaryDTO
                        ] as number | undefined,
                      )}
                </div>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-sky-600 shadow-inner ring-1 ring-white/70">
                <Icon className={`h-5 w-5 ${metric.tone}`} />
              </div>
            </CardHeader>

            <CardContent className="relative pt-4">
              {metric.key === 'accuracyRate' ? (
                <div className="space-y-2">
                  <Progress
                    value={normalizeAccuracy(data?.accuracyRate)}
                    className="h-2 bg-white/90"
                  />
                  <div className="text-sm text-slate-500">
                    Độ chính xác mô hình trên feedback đã ghi nhận.
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  {metric.key === 'accurateCount'
                    ? 'Số lượng feedback khớp dự đoán.'
                    : metric.key === 'inaccurateCount'
                      ? 'Số lượng feedback sai lệch cần ưu tiên xem xét.'
                      : 'Tổng số feedback đã được ghi nhận.'}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
