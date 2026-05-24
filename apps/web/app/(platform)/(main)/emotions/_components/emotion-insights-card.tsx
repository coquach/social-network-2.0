import { AlertTriangle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmotionDashboardInsights } from '@repo/shared';

import {
  getInsightIcon,
  getInsightRecommendation,
  getInsightToneStyles,
} from '../lib/emotion-ui';

export const EmotionInsightsCard = () => {
  const insightsQuery = useEmotionDashboardInsights();

  const toneLabel: Record<string, string> = {
    positive: 'Tích cực',
    neutral: 'Trung tính',
    warning: 'Cảnh báo',
    critical: 'Nguy cấp',
  };

  if (insightsQuery.isLoading) {
    return (
      <Card className="rounded-3xl border-slate-200/90 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.55)]">
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-2 h-4 w-52" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-2xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (insightsQuery.isError) {
    return (
      <Card className="rounded-3xl border-rose-200 bg-rose-50/60 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.55)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-rose-700">
            Gợi ý hành động
          </CardTitle>
          <p className="text-sm text-rose-700/80">
            Không thể tải dữ liệu insight ở thời điểm này.
          </p>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="border-rose-200 bg-white text-rose-700 hover:bg-rose-100"
            onClick={() => insightsQuery.refetch()}
          >
            Tải lại insight
          </Button>
        </CardContent>
      </Card>
    );
  }

  const insights = insightsQuery.data ?? [];

  if (insights.length === 0) {
    return (
      <Card className="rounded-3xl border-slate-200/90 bg-slate-50/70 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.55)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Gợi ý hành động
          </CardTitle>
          <p className="text-sm text-slate-600">
            Hiện chưa có insight nổi bật. Tín hiệu cảm xúc đang tương đối ổn
            định.
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-slate-200/90 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.55)]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-semibold text-slate-900">
          Gợi ý hành động
        </CardTitle>
        <p className="text-sm text-slate-600">
          Tóm tắt dễ hiểu kèm khuyến nghị bước tiếp theo.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((item, index) => {
          const tone = getInsightToneStyles(item.tone);
          const Icon = getInsightIcon(item.type);

          return (
            <div
              key={`${item.type}-${index}`}
              className={`rounded-2xl border p-4 shadow-[0_14px_28px_-22px_rgba(15,23,42,0.55)] ${tone.card} ${tone.leftBorder} border-l-4`}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${tone.iconWrap}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.message}
                  </p>
                </div>
                <Badge variant="outline" className={tone.toneBadge}>
                  {toneLabel[item.tone] ?? item.tone}
                </Badge>
              </div>
              <p className="rounded-xl border border-white/80 bg-white/70 px-3 py-2 text-sm leading-6 text-slate-700">
                {getInsightRecommendation(item.type)}
              </p>
            </div>
          );
        })}

        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <AlertTriangle className="h-4 w-4 text-slate-500" />
          Insight chỉ mang tính định hướng, không thay thế chẩn đoán chuyên môn.
        </div>
      </CardContent>
    </Card>
  );
};
