'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { ArrowUpRight, Loader2, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmotionHistory } from '@repo/shared';

import { formatRelativeTime, formatRiskLevel } from '../lib/emotion-formatters';
import {
  getEmotionEmoji,
  getEmotionLabel,
  getRiskStatus,
} from '../lib/emotion-mappers';
import { getRiskBadgeStyles } from '../lib/emotion-ui';

const targetLabel: Record<string, string> = {
  POST: 'Bài viết',
  COMMENT: 'Bình luận',
  SHARE: 'Chia sẻ',
};

export const EmotionHistorySection = () => {
  const historyQuery = useEmotionHistory({
    limit: 12,
    sortBy: 'createdAt',
    order: 'DESC',
  });

  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: '220px',
  });

  const entries = useMemo(
    () => historyQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [historyQuery.data],
  );

  useEffect(() => {
    if (
      inView &&
      historyQuery.hasNextPage &&
      !historyQuery.isFetchingNextPage
    ) {
      historyQuery.fetchNextPage();
    }
  }, [
    historyQuery,
    historyQuery.fetchNextPage,
    historyQuery.hasNextPage,
    historyQuery.isFetchingNextPage,
    inView,
  ]);

  return (
    <Card
      className="rounded-3xl border-slate-200/90 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.55)]"
      id="emotion-history"
    >
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Lịch sử cảm xúc
          </CardTitle>
          <p className="text-sm text-slate-600">
            Dòng thời gian các sự kiện cảm xúc gần đây của bạn.
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-slate-200 bg-slate-50 text-slate-700"
        >
          {entries.length.toLocaleString('vi-VN')} mục
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {historyQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center text-sm text-slate-500">
            <Sparkles className="mb-2 h-5 w-5 text-slate-500" />
            <p className="text-base font-medium text-slate-700">
              Chưa có dữ liệu lịch sử
            </p>
            <p className="text-sm text-slate-500">
              Hãy chờ thêm hoạt động để hệ thống phân tích và hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {entries.map((entry) => {
              const createdAt = new Date(entry.createdAt);
              const confidence =
                entry.finalConfidence > 1
                  ? entry.finalConfidence
                  : entry.finalConfidence * 100;

              const emotionEmoji = getEmotionEmoji(entry.finalEmotion);
              const emotionLabel = getEmotionLabel(entry.finalEmotion);
              const riskStatus = getRiskStatus(entry.riskHintLevel);

              return (
                <Link
                  key={`${entry.targetType}-${entry.targetId}-${createdAt.toISOString()}`}
                  href={`/emotions/${entry.targetId}?targetType=${entry.targetType}`}
                  className="block"
                >
                  <div className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_15px_30px_-26px_rgba(15,23,42,0.65)] transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_22px_36px_-24px_rgba(14,165,233,0.45)]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                      {emotionEmoji}
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-slate-200 bg-slate-50 text-slate-700"
                        >
                          {targetLabel[entry.targetType] ?? entry.targetType}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`border ${getRiskBadgeStyles(riskStatus)}`}
                        >
                          {formatRiskLevel(entry.riskHintLevel)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-slate-200 bg-white text-slate-600"
                        >
                          {emotionLabel}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {formatRelativeTime(createdAt)}
                        </span>
                      </div>
                      <p className="line-clamp-1 text-sm text-slate-700">
                        Độ tin cậy {confidence.toFixed(1)}%
                      </p>
                      <p className="line-clamp-1 text-xs text-slate-500">
                        Đối tượng {entry.targetType} - {entry.targetId}
                      </p>
                      <div className="flex items-center gap-2 text-sm font-semibold text-sky-600 underline underline-offset-4 group-hover:text-sky-700">
                        Xem chi tiết
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            <div ref={loadMoreRef} className="h-1 w-full" aria-hidden />
          </div>
        )}

        {historyQuery.isFetchingNextPage && (
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm text-slate-600">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang tải thêm lịch sử...
          </div>
        )}

        {!historyQuery.hasNextPage &&
          !historyQuery.isLoading &&
          entries.length > 0 && (
            <div className="flex justify-center pt-2">
              <p className="text-xs text-slate-500">
                Bạn đã xem hết dữ liệu hiện có.
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );
};
