import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowUpRight, Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalysisHistoryDTO, AnalysisStatus } from '@/models/emotion/emotionDTO';
import { getEmotionMeta } from './emotion-meta';

interface EmotionHistorySectionProps {
  entries: AnalysisHistoryDTO[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  loadingMore: boolean;
}

const statusColor = (status: AnalysisStatus) => {
  if (status === AnalysisStatus.SUCCESS) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  return 'bg-rose-50 text-rose-700 border-rose-100';
};

const targetLabel: Record<string, string> = {
  POST: 'Bài viết',
  COMMENT: 'Bình luận',
  SHARE: 'Chia sẻ',
};

export const EmotionHistorySection = ({
  entries,
  loading,
  hasMore,
  onLoadMore,
  loadingMore,
}: EmotionHistorySectionProps) => {
  return (
    <Card className="border-slate-100 shadow-sm" id="emotion-history">
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-sky-500">
            Nhật ký cảm xúc
          </CardTitle>
          <p className="text-sm text-slate-500">
            Các phân tích gần đây từ bài viết và bình luận của bạn.
          </p>
        </div>
        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
          {entries.length.toLocaleString('vi-VN')} mục
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-20 w-full" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
            <p className="text-base font-medium text-slate-700">
              Chưa có nhật ký nào
            </p>
            <p className="text-sm text-slate-500">
              Hãy đăng bài hoặc bình luận để xem hành trình cảm xúc của bạn.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => {
              const meta = getEmotionMeta(entry.finalEmotion as string);
              const createdAt = new Date(entry.createdAt);
              return (
                <Link key={entry.id} href={`/emotions/${entry.id}`} className="block">
                  <div className="group flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:border-sky-100 hover:shadow-[0_18px_38px_-22px_rgba(14,165,233,0.45)]">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                      style={{ backgroundColor: `${meta.color}22` }}
                      aria-hidden
                    >
                      {meta.emoji}
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
                          className={`border ${statusColor(entry.status)}`}
                        >
                          {entry.status === AnalysisStatus.SUCCESS
                            ? 'Thành công'
                            : 'Thất bại'}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-slate-200 bg-white text-slate-600"
                        >
                          {meta.label}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {format(createdAt, 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-slate-700">
                        {entry.content}
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
          </div>
        )}

        {hasMore && !loading && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              className="border-slate-200 text-slate-700 hover:border-slate-300"
              onClick={onLoadMore}
              disabled={loadingMore}
            >
              {loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tải thêm
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
