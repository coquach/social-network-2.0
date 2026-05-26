'use client';

import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageCircle,
  RefreshCcw,
  Sparkles,
  ThumbsUp,
  XCircle,
} from '@/lib/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  formatPercentage,
  formatRelativeTime,
} from '../lib/emotion-formatters';
import { getEmotionEmoji, getEmotionLabel } from '../lib/emotion-mappers';
import {
  queryKeys,
  type AnalysisSummaryDto,
  type FeedbackResponseDto,
  useEmotionFeedback,
  useSubmitEmotionFeedback,
} from '@repo/shared';
import { toast } from 'sonner';

type EmotionFeedbackSectionProps = {
  summary: AnalysisSummaryDto;
};

const formatFeedbackTime = (value?: Date | string) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return formatRelativeTime(date);
};

const getFeedbackTone = (feedback: FeedbackResponseDto) =>
  feedback.isAccurate
    ? {
        label: 'Khớp dự đoán',
        icon: CheckCircle2,
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        markerClassName: 'bg-emerald-500',
      }
    : {
        label: 'Chưa khớp',
        icon: XCircle,
        className: 'border-rose-200 bg-rose-50 text-rose-700',
        markerClassName: 'bg-rose-500',
      };

const EmotionFeedbackSkeleton = () => (
  <div className="space-y-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <Skeleton className="h-8 w-24 rounded-full" />
    </div>

    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-8 rounded-full" />
      ))}
    </div>
  </div>
);

const EmotionFeedbackItem = ({
  feedback,
}: {
  feedback: FeedbackResponseDto;
}) => {
  const tone = getFeedbackTone(feedback);
  const ToneIcon = tone.icon;
  const predictedLabel = getEmotionLabel(feedback.predictedEmotion as string);
  const predictedEmoji = getEmotionEmoji(feedback.predictedEmotion as string);
  const expectedLabel = feedback.expectedEmotion
    ? getEmotionLabel(feedback.expectedEmotion as string)
    : null;
  const expectedEmoji = feedback.expectedEmotion
    ? getEmotionEmoji(feedback.expectedEmotion as string)
    : null;
  const confidence = formatPercentage(feedback.confidence, {
    source: 'auto',
    maximumFractionDigits: 1,
  });
  const relativeTime = formatFeedbackTime(feedback.createdAt);

  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200/70 bg-white shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                tone.markerClassName,
              )}
            >
              <ToneIcon className="h-5 w-5 text-white" />
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-semibold',
                    tone.className,
                  )}
                >
                  {tone.label}
                </Badge>
                {relativeTime ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
                    <Clock3 className="h-3.5 w-3.5" />
                    {relativeTime}
                  </span>
                ) : null}
              </div>

              <p className="text-sm font-medium text-slate-900">
                Phản hồi cho kết quả phân tích hiện tại
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-600">
              Model {feedback.modelVersion}
            </span>
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100"
          >
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            Dự đoán: {predictedEmoji} {predictedLabel}
          </Badge>

          <Badge
            variant="outline"
            className="rounded-full border-slate-200 bg-white text-slate-600"
          >
            <ThumbsUp className="mr-1 h-3.5 w-3.5" />
            Độ tin cậy {confidence}
          </Badge>

          {expectedLabel ? (
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-slate-50 text-slate-600"
            >
              Thực tế: {expectedEmoji} {expectedLabel}
            </Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

const EmotionFeedbackList = ({
  feedbacks,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: {
  feedbacks: FeedbackResponseDto[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <EmotionFeedbackSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="rounded-2xl border-rose-200/80 bg-rose-50/40 shadow-none">
        <CardContent className="flex flex-col gap-4 p-4 text-sm text-rose-700 sm:flex-row sm:items-start sm:p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1 space-y-3">
            <p>{errorMessage || 'Đã có lỗi xảy ra khi tải phản hồi.'}</p>
            {onRetry ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Thử lại
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="flex min-h-60 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center shadow-none">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
          <MessageCircle className="h-5 w-5 text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">
          Chưa có phản hồi nào
        </h3>
        <p className="mt-1 max-w-md text-sm text-slate-500">
          Gửi phản hồi đầu tiên để giúp hệ thống hiểu rõ hơn mức độ chính xác
          của kết quả phân tích.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {feedbacks.map((feedback) => (
        <EmotionFeedbackItem key={feedback.id} feedback={feedback} />
      ))}
    </div>
  );
};

const EmotionFeedbackForm = ({ summary }: { summary: AnalysisSummaryDto }) => {
  const queryClient = useQueryClient();
  const submitFeedbackMutation = useSubmitEmotionFeedback();
  const [selectedAccuracy, setSelectedAccuracy] = useState<boolean | null>(
    null,
  );

  const predictedLabel = getEmotionLabel(summary.finalEmotion as string);
  const predictedEmoji = getEmotionEmoji(summary.finalEmotion as string);
  const confidence = formatPercentage(summary.confidence, {
    source: 'auto',
    maximumFractionDigits: 1,
  });

  const canSubmit =
    selectedAccuracy !== null && !submitFeedbackMutation.isPending;

  const handleSubmit = async () => {
    if (selectedAccuracy === null) return;

    const promise = submitFeedbackMutation.mutateAsync({
      targetId: summary.targetId,
      targetType: summary.targetType,
      isAccurate: selectedAccuracy,
    });

    toast.promise(promise, {
      loading: 'Đang gửi phản hồi...',
      success: 'Đã ghi nhận phản hồi.',
      error: 'Không thể gửi phản hồi. Vui lòng thử lại.',
    });

    try {
      await promise;
      setSelectedAccuracy(null);

      queryClient.invalidateQueries({
        queryKey: queryKeys.emotionJournal.feedback(
          summary.targetType,
          summary.targetId,
        ),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : null;
      if (message) {
        toast.error(message);
      }
    }
  };

  return (
    <Card className="rounded-3xl border-slate-200/70 bg-white shadow-sm">
      <CardHeader className="space-y-1 border-b border-slate-100 bg-slate-50/40">
        <CardTitle className="text-base font-semibold text-slate-900">
          Gửi phản hồi nhanh
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Chọn đánh giá đúng hoặc chưa đúng cho kết quả hiện tại. Không cần nhập
          thêm nội dung.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Kết quả đang hiển thị
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100"
            >
              {predictedEmoji} {predictedLabel}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-white text-slate-600"
            >
              Độ tin cậy {confidence}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-900">
            Kết quả này có đúng với trải nghiệm của bạn không?
          </p>

          <div
            role="group"
            aria-label="Đánh giá độ chính xác"
            className="grid gap-2 sm:grid-cols-2"
          >
            <button
              type="button"
              onClick={() => setSelectedAccuracy(true)}
              disabled={submitFeedbackMutation.isPending}
              className={cn(
                'flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition',
                selectedAccuracy === true
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
                submitFeedbackMutation.isPending &&
                  'cursor-not-allowed opacity-70',
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              Đúng với thực tế
            </button>

            <button
              type="button"
              onClick={() => setSelectedAccuracy(false)}
              disabled={submitFeedbackMutation.isPending}
              className={cn(
                'flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition',
                selectedAccuracy === false
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
                submitFeedbackMutation.isPending &&
                  'cursor-not-allowed opacity-70',
              )}
            >
              <XCircle className="h-4 w-4" />
              Chưa đúng
            </button>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full rounded-2xl"
        >
          {submitFeedbackMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang gửi...
            </>
          ) : (
            'Gửi phản hồi'
          )}
        </Button>

        <p className="text-xs leading-5 text-slate-500">
          Phản hồi của bạn chỉ ghi nhận mức độ đúng/sai của dự đoán hiện tại.
        </p>
      </CardContent>
    </Card>
  );
};

export const EmotionFeedbackSection = ({
  summary,
}: EmotionFeedbackSectionProps) => {
  const feedbackQuery = useEmotionFeedback(
    summary.targetType,
    summary.targetId,
  );

  const feedbacks = feedbackQuery.data ?? [];
  const feedbackStats = useMemo(
    () => ({
      total: feedbacks.length,
      accurate: feedbacks.filter((feedback) => feedback.isAccurate).length,
      inaccurate: feedbacks.filter((feedback) => !feedback.isAccurate).length,
    }),
    [feedbacks],
  );

  return (
    <section id="emotion-feedback" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-600">
            Feedback section
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Phản hồi về phân tích cảm xúc
          </h2>
          <p className="text-sm text-slate-500">
            Gửi đánh giá ngắn gọn để cải thiện chất lượng dự đoán cho đối tượng
            này.
          </p>
        </div>

        <Badge
          variant="outline"
          className="rounded-full border-slate-200 bg-white px-3 py-1.5 text-slate-700"
        >
          {feedbackStats.total.toLocaleString('vi-VN')} phản hồi
        </Badge>
      </div>

      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <EmotionFeedbackForm summary={summary} />

        <Card className="rounded-3xl border-slate-200/70 bg-white shadow-sm">
          <CardHeader className="space-y-1 border-b border-slate-100 bg-slate-50/40">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">
                  Danh sách phản hồi
                </CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Các đánh giá đã được ghi nhận cho đối tượng hiện tại.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <Badge
                  variant="secondary"
                  className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                >
                  Đúng {feedbackStats.accurate}
                </Badge>
                <Badge
                  variant="secondary"
                  className="rounded-full bg-rose-50 text-rose-700 hover:bg-rose-50"
                >
                  Chưa đúng {feedbackStats.inaccurate}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5">
            <EmotionFeedbackList
              feedbacks={feedbacks}
              isLoading={feedbackQuery.isLoading}
              isError={feedbackQuery.isError}
              errorMessage={(feedbackQuery.error as Error | undefined)?.message}
              onRetry={() => feedbackQuery.refetch()}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
