'use client';

import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TargetType, useEmotionAnalysis } from '@repo/shared';
import { EmotionContentPreview } from '../_components/emotion-content-preview';
import { EmotionFeedbackSection } from '../_components/emotion-feedback-section';
import { EmotionScoreBlock } from '../_components/emotion-score-block';
import { EmotionHeroCard } from '../_components/emotion-hero';

type EmotionDetailClientProps = {
  targetId: string;
  targetType: keyof typeof TargetType;
};

export const EmotionDetailClient = ({
  targetId,
  targetType,
}: EmotionDetailClientProps) => {
  const detailQuery = useEmotionAnalysis(TargetType[targetType], targetId);
  const summary = detailQuery.data;

  return (
    <div className="mx-auto max-w-280 space-y-6 bg-slate-50/50 px-4 py-8 sm:py-10">
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
          <EmotionHeroCard summary={summary} />

          <EmotionContentPreview summary={summary} />

          <Card className="overflow-hidden border-slate-200/70 bg-white shadow-sm transition-shadow hover:shadow-md">
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

          <EmotionFeedbackSection summary={summary} />
        </div>
      )}
    </div>
  );
};
