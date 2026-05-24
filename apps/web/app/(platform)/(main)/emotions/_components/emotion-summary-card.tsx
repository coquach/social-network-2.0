'use client';

import { ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  ShieldAlert,
  Smile,
  TrendingUp,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmotionDashboardSummary } from '@repo/shared';

import {
  clampPercent,
  formatMoodTrend,
  formatPercentage,
  formatRiskLevel,
} from '../lib/emotion-formatters';
import {
  getEmotionEmoji,
  getEmotionLabel,
  getRiskStatus,
} from '../lib/emotion-mappers';
import { getRiskBadgeStyles } from '../lib/emotion-ui';

interface EmotionSummaryCardProps {
  title: string;
  icon?: ReactNode;
  value: ReactNode;
  description: string;
  badge?: ReactNode;
  footer?: ReactNode;
  progressValue?: number;
  progressLabel?: string;
}

export const EmotionSummaryCard = ({
  title,
  icon,
  value,
  description,
  badge,
  footer,
  progressValue,
  progressLabel,
}: EmotionSummaryCardProps) => {
  return (
    <Card className="flex h-full flex-col rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_38px_-34px_rgba(15,23,42,0.6)] backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </p>
        <div className="flex items-center gap-2 text-slate-500">
          {icon}
          {badge}
        </div>
      </div>

      <div className="mt-3 text-[1.65rem] font-semibold tracking-tight text-slate-900">
        {value}
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

      {typeof progressValue === 'number' && (
        <div className="mt-4 space-y-1.5">
          <Progress value={progressValue} className="h-2 bg-slate-100" />
          {progressLabel && (
            <p className="text-xs font-medium text-slate-500">
              {progressLabel}
            </p>
          )}
        </div>
      )}

      {footer && (
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          {footer}
        </p>
      )}
    </Card>
  );
};

const SummarySkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_38px_-34px_rgba(15,23,42,0.6)] backdrop-blur-sm"
      >
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-8 w-36" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-2 w-full" />
      </div>
    ))}
  </div>
);

export const EmotionSummaryGrid = () => {
  const summaryQuery = useEmotionDashboardSummary();

  if (summaryQuery.isLoading) {
    return <SummarySkeleton />;
  }

  if (summaryQuery.isError) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-600" />
          <div className="space-y-3">
            <p className="text-sm font-medium text-rose-700">
              Không thể tải phần tóm tắt ngay lúc này.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
              onClick={() => summaryQuery.refetch()}
            >
              Tải lại tóm tắt
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const data = summaryQuery.data;

  if (!data) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 text-sm text-slate-600">
        Chưa có dữ liệu tóm tắt để hiển thị.
      </section>
    );
  }

  const riskStatus = getRiskStatus(data.riskLevel);
  const moodTrend = formatMoodTrend(
    data.shortTermTrend ?? data.emotionMomentum,
  );
  const negativityPercent = clampPercent(data.recentNegativityScore);
  const positivityPercent = Math.max(0, 100 - negativityPercent);
  const dominantLabel = getEmotionLabel(data.dominantEmotion);
  const dominantEmoji = getEmotionEmoji(data.dominantEmotion);

  const MoodIcon =
    moodTrend.direction === 'up'
      ? ArrowUpRight
      : moodTrend.direction === 'down'
        ? ArrowDownRight
        : Minus;

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <EmotionSummaryCard
        title="Trạng thái hiện tại"
        icon={<ShieldAlert className="h-4 w-4 text-rose-600" />}
        value={formatRiskLevel(data.riskLevel)}
        description={
          riskStatus === 'critical'
            ? 'Đang có dấu hiệu căng thẳng cảm xúc cao.'
            : riskStatus === 'warning'
              ? 'Có tín hiệu áp lực tăng dần.'
              : 'Đang ở vùng ổn định.'
        }
        badge={
          <span
            className={`rounded-full border px-2 py-1 text-xs font-semibold uppercase tracking-wide ${getRiskBadgeStyles(riskStatus)}`}
          >
            {riskStatus === 'critical'
              ? 'Nguy cấp'
              : riskStatus === 'warning'
                ? 'Cảnh báo'
                : 'Bình thường'}
          </span>
        }
      />

      <EmotionSummaryCard
        title="Cảm xúc nổi bật"
        icon={<Smile className="h-4 w-4 text-amber-600" />}
        value={
          <span className="inline-flex items-center gap-2 text-slate-900">
            <span className="text-2xl" aria-hidden>
              {dominantEmoji}
            </span>
            <span>{dominantLabel}</span>
          </span>
        }
        description="Cảm xúc chiếm ưu thế trong giai đoạn gần đây."
      />

      <EmotionSummaryCard
        title="Tỷ lệ tích cực"
        icon={<TrendingUp className="h-4 w-4 text-sky-700" />}
        value={formatPercentage(positivityPercent, { source: 'percent' })}
        description="Phần phản hồi mang sắc thái tích cực hoặc cân bằng."
        progressValue={positivityPercent}
        progressLabel={`${positivityPercent.toFixed(1)}% tích cực`}
      />

      <EmotionSummaryCard
        title="Xu hướng tâm trạng"
        icon={<MoodIcon className="h-4 w-4 text-slate-700" />}
        value={moodTrend.label}
        description={moodTrend.hint}
        footer={moodTrend.deltaText}
      />
    </section>
  );
};
