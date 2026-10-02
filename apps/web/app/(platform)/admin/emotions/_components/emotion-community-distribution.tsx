'use client';

import * as React from 'react';
import { PieChart as PieIcon, Smile, HeartPulse } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmotionDistributionDTO } from '@/models/emotion/adminEmotionDTO';

type Props = {
  distribution?: EmotionDistributionDTO;
  daysWindow?: number;
  loading?: boolean;
};

const EMOTIONS_CONFIG = [
  {
    key: 'joy',
    label: 'Vui vẻ',
    color: '#eab308',
    bg: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  {
    key: 'sadness',
    label: 'Buồn bã',
    color: '#3b82f6',
    bg: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  {
    key: 'anger',
    label: 'Tức giận',
    color: '#ef4444',
    bg: 'bg-red-500',
    lightBg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  {
    key: 'fear',
    label: 'Sợ hãi',
    color: '#8b5cf6',
    bg: 'bg-purple-500',
    lightBg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  {
    key: 'disgust',
    label: 'Chán ghét',
    color: '#10b981',
    bg: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  {
    key: 'surprise',
    label: 'Ngạc nhiên',
    color: '#f97316',
    bg: 'bg-orange-500',
    lightBg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  {
    key: 'neutral',
    label: 'Trung lập',
    color: '#64748b',
    bg: 'bg-slate-500',
    lightBg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
  },
] as const;

export function EmotionCommunityDistribution({
  distribution,
  daysWindow = 30,
  loading,
}: Props) {
  if (loading) {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-0">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-72 mt-1" />
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = distribution?.total || 1;

  // Find dominant emotion
  let dominantEmotion: (typeof EMOTIONS_CONFIG)[number] = EMOTIONS_CONFIG[0];
  let maxCount = -1;

  for (const item of EMOTIONS_CONFIG) {
    const count = distribution?.[item.key as keyof EmotionDistributionDTO] || 0;
    if (typeof count === 'number' && count > maxCount) {
      maxCount = count;
      dominantEmotion = item;
    }
  }

  const dominantPercent =
    total > 0 && maxCount >= 0 ? ((maxCount / total) * 100).toFixed(1) : '0';

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <PieIcon className="h-5 w-5 text-sky-600" />
              Phân bổ cảm xúc cộng đồng ({daysWindow} ngày qua)
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Tỉ lệ và tần suất xuất hiện của 7 nhóm cảm xúc qua các nội dung được phân tích trong {daysWindow} ngày gần nhất.
            </p>
          </div>
          {maxCount > 0 && (
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${dominantEmotion.lightBg} ${dominantEmotion.border} ${dominantEmotion.text}`}
            >
              <Smile className="h-4 w-4" />
              Chủ đạo: {dominantEmotion.label} ({dominantPercent}%)
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-6">
        {/* Multi-segment progress bar */}
        <div className="space-y-2">
          <div className="h-4 w-full flex rounded-full overflow-hidden bg-slate-100 p-0.5 gap-0.5">
            {EMOTIONS_CONFIG.map((item) => {
              const count = Number(distribution?.[item.key as keyof EmotionDistributionDTO] || 0);
              const percent = total > 0 ? (count / total) * 100 : 0;
              if (percent <= 0) return null;

              return (
                <div
                  key={item.key}
                  style={{ width: `${percent}%` }}
                  className={`${item.bg} h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 relative group`}
                  title={`${item.label}: ${count.toLocaleString('vi-VN')} (${percent.toFixed(1)}%)`}
                />
              );
            })}
          </div>
        </div>

        {/* Emotion cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {EMOTIONS_CONFIG.map((item) => {
            const count = Number(distribution?.[item.key as keyof EmotionDistributionDTO] || 0);
            const percent = total > 0 ? ((count / total) * 100).toFixed(1) : '0';

            return (
              <div
                key={item.key}
                className={`rounded-2xl border p-3 flex flex-col justify-between transition-all hover:shadow-sm ${item.lightBg} ${item.border}`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className={`text-xs font-semibold ${item.text}`}>
                    {item.label}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-white/80 px-1.5 py-0.5 rounded-full border border-slate-200/50">
                    {percent}%
                  </span>
                </div>
                <div className="text-xl font-bold tracking-tight text-slate-900">
                  {count.toLocaleString('vi-VN')}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  lượt ghi nhận
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
