'use client';

import * as React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, AlertOctagon, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RiskLevelDistributionDTO } from '@/models/emotion/adminEmotionDTO';

type Props = {
  distribution?: RiskLevelDistributionDTO;
  loading?: boolean;
};

const RISK_LEVELS = [
  {
    key: 'normal',
    label: 'Bình thường / Ổn định',
    description: 'Tâm lý ổn định, không có dấu hiệu stress kéo dài',
    color: '#10b981',
    bg: 'bg-emerald-500',
    lightBg: 'bg-emerald-50/70',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: ShieldCheck,
  },
  {
    key: 'low',
    label: 'Rủi ro nhẹ',
    description: 'Có dao động cảm xúc nhẹ, cần quan sát tự nhiên',
    color: '#06b6d4',
    bg: 'bg-cyan-500',
    lightBg: 'bg-cyan-50/70',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    icon: UserCheck,
  },
  {
    key: 'medium',
    label: 'Cần chú ý / Theo dõi',
    description: 'Dấu hiệu tiêu cực lặp lại, khuyến nghị gợi ý bài tập',
    color: '#f59e0b',
    bg: 'bg-amber-500',
    lightBg: 'bg-amber-50/70',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: AlertTriangle,
  },
  {
    key: 'high',
    label: 'Nguy cơ cao',
    description: 'Cảm xúc tiêu cực sâu kéo dài, cần can thiệp hỗ trợ',
    color: '#f97316',
    bg: 'bg-orange-500',
    lightBg: 'bg-orange-50/70',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: ShieldAlert,
  },
  {
    key: 'critical',
    label: 'Khẩn cấp / Can thiệp ngay',
    description: 'Nguy cơ tổn thương nghiêm trọng, cần kích hoạt hotline',
    color: '#ef4444',
    bg: 'bg-red-500',
    lightBg: 'bg-red-50/70',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: AlertOctagon,
  },
] as const;

export function EmotionRiskDistributionCard({ distribution, loading }: Props) {
  if (loading) {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-0">
          <Skeleton className="h-6 w-60" />
          <Skeleton className="h-4 w-80 mt-1" />
        </CardHeader>
        <CardContent className="pt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const totalUsers = distribution?.totalUsers || 0;

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              Chỉ số sức khỏe tinh thần cộng đồng
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Phân loại người dùng theo các cấp độ cảnh báo sức khỏe tinh thần (Mental Health Risk Engine).
            </p>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Tổng: <strong className="text-slate-900">{totalUsers.toLocaleString('vi-VN')}</strong> tài khoản được theo dõi
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        {RISK_LEVELS.map((level) => {
          const count = Number(distribution?.[level.key as keyof RiskLevelDistributionDTO] || 0);
          const percent = totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(1) : '0';
          const Icon = level.icon;

          return (
            <div
              key={level.key}
              className={`rounded-2xl border p-4 transition-all hover:shadow-sm ${level.lightBg} ${level.border}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-white shadow-xs border ${level.border} ${level.text}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${level.text}`}>
                        {level.label}
                      </span>
                      <span className="text-xs font-bold text-slate-600 bg-white/90 px-2 py-0.5 rounded-full border border-slate-200/60">
                        {percent}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{level.description}</p>
                  </div>
                </div>

                <div className="text-right sm:self-center pl-10 sm:pl-0">
                  <div className="text-lg font-bold text-slate-900">
                    {count.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">người</span>
                  </div>
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full bg-slate-200/70 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full ${level.bg} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(0, Number(percent)))}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
