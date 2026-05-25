'use client';

import { AlertTriangle, Flame, Smile, Users } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardOverviewResponseDTO } from '@/models/emotion/adminEmotionDTO';

type Props = {
  data?: DashboardOverviewResponseDTO;
  loading?: boolean;
};

const formatNumber = (value?: number) =>
  typeof value === 'number' ? value.toLocaleString('vi-VN') : '0';

const formatPercent = (value?: number) => {
  if (typeof value !== 'number') return '0%';
  const normalized = value <= 1 ? value * 100 : value;

  return `${normalized.toFixed(normalized >= 10 ? 0 : 1)}%`;
};

const metrics = [
  {
    key: 'totalAnalyzedSnapshots',
    label: 'Lượt phân tích',
    description: 'Tổng snapshot đã xử lý',
    icon: Users,
    tone: 'text-sky-600',
    panelClass:
      'border-sky-200 bg-linear-to-br from-sky-100 via-sky-50 to-white',
    percent: false,
  },
  {
    key: 'highRiskUsers',
    label: 'Người dùng rủi ro',
    description: 'Cần theo dõi thêm',
    icon: AlertTriangle,
    tone: 'text-amber-600',
    panelClass:
      'border-amber-200 bg-linear-to-br from-amber-100 via-amber-50 to-white',
    percent: false,
  },
  {
    key: 'criticalRiskUsers',
    label: 'Người dùng nguy cấp',
    description: 'Ưu tiên kiểm tra ngay',
    icon: Flame,
    tone: 'text-rose-600',
    panelClass:
      'border-rose-200 bg-linear-to-br from-rose-100 via-rose-50 to-white',
    percent: false,
  },
  {
    key: 'averageNegativityScore',
    label: 'Điểm tiêu cực',
    description: 'Mức độ tiêu cực trung bình',
    icon: Smile,
    tone: 'text-emerald-600',
    panelClass:
      'border-emerald-200 bg-linear-to-br from-emerald-100 via-emerald-50 to-white',
    percent: true,
  },
] as const;

export function EmotionOverviewCards({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            key={metric.key}
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm ${metric.panelClass}`}
          >
            <div className="relative flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-24" />
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 text-sky-600 shadow-inner">
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
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const value = data?.[
          metric.key as keyof DashboardOverviewResponseDTO
        ] as number | undefined;

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
                <div className="text-3xl font-bold tracking-tight text-slate-900">
                  {metric.percent ? formatPercent(value) : formatNumber(value)}
                </div>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-sky-600 shadow-inner ring-1 ring-white/70">
                <Icon className={`h-5 w-5 ${metric.tone}`} />
              </div>
            </CardHeader>

            <CardContent className="relative pt-4">
              <div className="text-sm text-slate-500">{metric.description}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
