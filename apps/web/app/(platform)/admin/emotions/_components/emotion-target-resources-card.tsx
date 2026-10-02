'use client';

import * as React from 'react';
import {
  FileText,
  MessageSquare,
  HeartHandshake,
  PhoneCall,
  Activity,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ResourceSummaryDTO,
  TargetTypeBreakdownDTO,
} from '@/models/emotion/adminEmotionDTO';

type Props = {
  targets?: TargetTypeBreakdownDTO;
  resources?: ResourceSummaryDTO;
  daysWindow?: number;
  loading?: boolean;
};

export function EmotionTargetAndResourcesCard({
  targets,
  resources,
  daysWindow = 30,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-0">
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-0">
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalTargets = targets?.total || 1;
  const targetItems = [
    {
      label: 'Bài viết (Posts)',
      description: 'Cảm xúc qua bài đăng công khai của người dùng',
      count: targets?.posts || 0,
      icon: FileText,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      barBg: 'bg-sky-500',
    },
    {
      label: 'Bình luận (Comments)',
      description: 'Cảm xúc qua các phản hồi và thảo luận',
      count: targets?.comments || 0,
      icon: MessageSquare,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      barBg: 'bg-indigo-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Target Type Breakdown */}
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Layers className="h-5 w-5 text-indigo-600" />
            Nguồn nội dung phân tích ({daysWindow} ngày qua)
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Phân bố sự kiện cảm xúc quét được từ Bài viết và Bình luận công khai trong {daysWindow} ngày gần nhất.
          </p>
        </CardHeader>

        <CardContent className="pt-4 space-y-3">
          {targetItems.map((item) => {
            const percent =
              totalTargets > 0
                ? ((item.count / totalTargets) * 100).toFixed(1)
                : '0';
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${item.bg} ${item.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-800">
                        {item.label}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">
                      {item.count.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">
                      ({percent}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.barBg} rounded-full transition-all duration-300`}
                    style={{
                      width: `${Math.min(100, Math.max(0, Number(percent)))}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Intervention Resource Readiness */}
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Activity className="h-5 w-5 text-emerald-600" />
            Sẵn sàng can thiệp & hỗ trợ
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Tình trạng kích hoạt các kênh bài tập tâm lý và hotline cứu trợ.
          </p>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Exercises readiness */}
          <div className="rounded-2xl border border-emerald-200/80 bg-linear-to-br from-emerald-50/70 to-white p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Bài tập hỗ trợ tâm lý
                  </h4>
                  <p className="text-xs text-slate-500">
                    Kỹ thuật thở, viết nhật ký, chánh niệm & CBT
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-emerald-700">
                  {resources?.activeExercises || 0} / {resources?.totalExercises || 0}
                </div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Khả dụng
                </div>
              </div>
            </div>
          </div>

          {/* Hotlines readiness */}
          <div className="rounded-2xl border border-sky-200/80 bg-linear-to-br from-sky-50/70 to-white p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Hotline can thiệp khẩn cấp
                  </h4>
                  <p className="text-xs text-slate-500">
                    Đường dây nóng hỗ trợ tâm lý và khủng hoảng 24/7
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-sky-700">
                  {resources?.activeHotlines || 0} / {resources?.totalHotlines || 0}
                </div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Sẵn sàng
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
