'use client';

import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AnalysisSummaryDto,
  TargetType,
  useEmotionAnalysis,
} from '@repo/shared';
import { EmotionContentPreview } from '../_components/emotion-content-preview';
import { EmotionScoreBlock } from '../_components/emotion-score-block';
import { getEmotionEmoji, getEmotionLabel } from '../lib/emotion-mappers';
import { formatRiskLevel } from '../lib/emotion-formatters';

type EmotionDetailClientProps = {
  targetId: string;
  targetType: TargetType;
};

export const EmotionDetailClient = ({
  targetId,
  targetType,
}: EmotionDetailClientProps) => {
  const detailQuery = useEmotionAnalysis(targetType, targetId);
  const summary = detailQuery.data;
  const finalEmotionLabel = summary
    ? getEmotionLabel(summary.finalEmotion as string)
    : null;
  const finalEmotionEmoji = summary
    ? getEmotionEmoji(summary.finalEmotion as string)
    : null;

  const riskColor: Record<string, string> = {
    none: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    low: 'border-sky-100 bg-sky-50 text-sky-700',
    medium: 'border-amber-100 bg-amber-50 text-amber-700',
    high: 'border-rose-100 bg-rose-50 text-rose-700',
  };

  const analysisUpdatedAt = summary
    ? format(new Date(summary.createdAt), 'dd/MM/yyyy HH:mm')
    : null;

  const confidenceLabel = summary
    ? `${(summary.confidence * 100).toFixed(1)}%`
    : '—';

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:py-10">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          className="border-slate-200/80 bg-white text-slate-700 hover:border-slate-300"
          asChild
        >
          <Link href="/emotions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Trở lại
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Phân tích cảm xúc chi tiết
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Xem nội dung gốc và kết quả phân tích theo cùng một ngữ cảnh.
          </p>
        </div>
      </div>

      {detailQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : detailQuery.isError ? (
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="flex items-center gap-3 p-6 text-sm text-rose-600">
            <AlertTriangle className="h-5 w-5" />
            Đã có lỗi xảy ra khi tải dữ liệu phân tích cảm xúc.
          </CardContent>
        </Card>
      ) : !summary ? (
        <Card className="border-slate-200/70 shadow-sm">
          <CardContent className="p-6 text-sm text-slate-600">
            Không tìm thấy dữ liệu phân tích cảm xúc.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <EmotionContentPreview summary={summary} />

          <Card className="overflow-hidden border-slate-200/70 bg-white shadow-sm transition-shadow hover:shadow-md">
            <CardHeader className="border-b border-slate-100/80 bg-linear-to-r from-slate-50 via-white to-emerald-50/40 p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                  <Badge
                    variant="outline"
                    className="border-emerald-100 bg-emerald-50 text-emerald-700"
                  >
                    Kết quả cảm xúc
                  </Badge>

                  <CardTitle className="flex flex-wrap items-center gap-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    <span className="text-3xl sm:text-4xl">
                      {finalEmotionEmoji ?? '•'}
                    </span>
                    <span>{finalEmotionLabel ?? summary.finalEmotion}</span>
                  </CardTitle>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <Badge
                    variant="outline"
                    className="border-slate-200 bg-white text-slate-700"
                  >
                    Độ tin cậy {confidenceLabel}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={riskColor[summary.riskLevel] ?? riskColor.none}
                  >
                    Mức độ rủi ro: {formatRiskLevel(summary.riskLevel)}
                  </Badge>
                  {analysisUpdatedAt ? (
                    <span>Cập nhật {analysisUpdatedAt}</span>
                  ) : null}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 p-4 sm:p-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Phân bố cảm xúc
                    </p>
                    <p className="text-xs text-slate-500">
                      Tỷ trọng các nhãn cảm xúc trong kết quả cuối.
                    </p>
                  </div>
                </div>

                <EmotionScoreBlock scores={summary.finalScores} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
