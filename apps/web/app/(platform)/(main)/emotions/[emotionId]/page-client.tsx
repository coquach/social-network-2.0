'use client';

import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmotionDetail } from '@/hooks/use-emotion-journal';
import { DetailMetaCard } from '../_components/detail-meta-card';
import { getEmotionMeta } from '../_components/emotion-meta';
import { EmotionScoreBlock } from '../_components/emotion-score-block';
import { ImageAnalysisCard } from '../_components/image-analysis-card';
import { TextAnalysisCard } from '../_components/text-analysis-card';

const targetLabel: Record<string, string> = {
  POST: 'Post',
  COMMENT: 'Comment',
  SHARE: 'Share',
};

type EmotionDetailClientProps = {
  emotionId: string;
  hasError?: boolean;
};

export const EmotionDetailClient = ({
  emotionId,
  hasError,
}: EmotionDetailClientProps) => {
  const detailQuery = useEmotionDetail(emotionId);
  const summary = detailQuery.data;
  const finalMeta = getEmotionMeta(summary?.finalEmotion as string);

  const createdAt = useMemo(() => {
    if (!summary?.createdAt) return null;
    const value = new Date(summary.createdAt);
    return Number.isNaN(value.getTime()) ? null : value;
  }, [summary?.createdAt]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className="border-slate-200 text-slate-700 hover:border-slate-300"
          asChild
        >
          <Link href="/emotions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Trở lại
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-sky-500">
          Phân tích cảm xúc chi tiết
        </h1>
      </div>

      {detailQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : detailQuery.error || hasError || !summary ? (
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="flex items-center gap-3 p-6 text-sm text-rose-600">
            <AlertTriangle className="h-5 w-5" />
            Đã có lỗi xảy ra khi tải dữ liệu phân tích cảm xúc. Vui lòng thử
          </CardContent>
        </Card>
      ) : (
        <>
          <DetailMetaCard
            summary={summary}
            analysisId={emotionId}
            createdAt={createdAt}
            targetLabel={targetLabel}
          />

          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-sky-700">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                  style={{ backgroundColor: `${finalMeta.color}22` }}
                >
                  {finalMeta.emoji}
                </div>
                <div>
                  <p className="text-sm text-slate-500">Phân tích cuối</p>
                  <p className="text-xl font-semibold text-slate-900">
                    {finalMeta.label}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">
                  Điểm cảm xúc cuối cùng
                </p>
                <p className="text-xs text-slate-500">
                  Dựa trên tất cả các phân tích cảm xúc từ văn bản và hình ảnh
                </p>
                <div className="mt-3">
                  <EmotionScoreBlock scores={summary.finalScores} />
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-700">
                  Mục tiêu phân tích
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {summary.targetId}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <TextAnalysisCard textEmotion={summary.textEmotion} />
            <ImageAnalysisCard images={summary.imageEmotions} />
          </div>
        </>
      )}
    </div>
  );
};
