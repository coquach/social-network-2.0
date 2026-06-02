'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

import {
  AppealStatus,
  useCreateModerationAppeal,
  useModerationRecordDetail,
} from '@repo/shared';

import { ErrorFallback } from '@/components/error-fallback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

import {
  formatDateTime,
  getDecisionLabel,
  getDecisionToneClassName,
  getModerationTypeLabel,
  getSeverityLabel,
  getSeverityToneClassName,
  normalizeViolations,
} from './moderation-history-utils';

function SeverityBadge({ severity }: { severity: string }) {
  const normalized = severity.toUpperCase();

  return (
    <Badge
      className={['gap-1.5 border', getSeverityToneClassName(normalized)].join(
        ' ',
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current/80" />
      {getSeverityLabel(normalized)}
    </Badge>
  );
}

function DecisionBadge({ decision }: { decision?: string }) {
  const normalized = decision?.toUpperCase();

  return (
    <Badge
      className={['gap-1.5 border', getDecisionToneClassName(normalized)].join(
        ' ',
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current/80" />
      {getDecisionLabel(normalized)}
    </Badge>
  );
}

export function ModerationDetailSheet({
  moderationId,
  open,
  onOpenChange,
}: {
  moderationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const detailQuery = useModerationRecordDetail(moderationId ?? '');
  const appealMutation = useCreateModerationAppeal();
  const [appealReason, setAppealReason] = React.useState('');

  const moderation = detailQuery.data?.moderation;
  const target = detailQuery.data?.target;
  const violations = React.useMemo(
    () => normalizeViolations(moderation?.violations),
    [moderation?.violations],
  );
  const hasPendingAppeal =
    detailQuery.data?.appeals?.some(
      (appeal) => appeal.status === AppealStatus.PENDING,
    ) ?? false;

  React.useEffect(() => {
    setAppealReason('');
  }, [moderationId, open]);

  const handleSubmitAppeal = async () => {
    if (!moderation || !appealReason.trim() || hasPendingAppeal) {
      return;
    }

    await appealMutation.mutateAsync({
      moderationId: moderation.id,
      reason: appealReason.trim(),
    });

    setAppealReason('');
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
      }}
    >
      <SheetContent
        side="right"
        className="w-full overflow-hidden p-0 sm:max-w-176"
      >
        <SheetHeader className="border-b border-slate-200/70 bg-linear-to-r from-slate-50 via-white to-sky-50/50 px-5 py-4 dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-sky-950/20">
          <SheetTitle className="text-sky-700 dark:text-sky-300">
            Chi tiết kiểm duyệt
          </SheetTitle>
          <SheetDescription className="text-slate-500 dark:text-slate-400">
            Xem nội dung, quyết định và các thông tin liên quan của bản ghi.
          </SheetDescription>
        </SheetHeader>

        <div className="flex h-full min-h-0 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-4 pb-24 dark:bg-slate-950/40 sm:p-5">
            {detailQuery.isLoading ? (
              <div className="flex items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải chi tiết…
              </div>
            ) : null}

            {detailQuery.isError ? (
              <ErrorFallback
                message={
                  detailQuery.error instanceof Error
                    ? detailQuery.error.message
                    : 'Không thể tải chi tiết kiểm duyệt.'
                }
              />
            ) : null}

            {!detailQuery.isLoading && moderation ? (
              <>
                <section className="space-y-4 rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-sky-200/70 bg-sky-50/80 text-sky-700 hover:bg-sky-50 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300">
                      {getModerationTypeLabel(moderation)}
                    </Badge>
                    <SeverityBadge severity={moderation.maxSeverity} />
                    <DecisionBadge decision={moderation.finalDecision} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/70">
                      <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        Trạng thái
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                        {getDecisionLabel(moderation.finalDecision)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/70">
                      <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        Độ tin cậy
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                        {Math.round(
                          moderation.confidence <= 1
                            ? moderation.confidence * 100
                            : moderation.confidence,
                        )}
                        %
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/70">
                      <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        Thời gian
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                        {formatDateTime(moderation.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                    <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Nội dung kiểm duyệt
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {moderation.displayMessage}
                    </p>
                  </div>

                  {moderation.targetPreview?.content ? (
                    <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                      <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        Preview mục tiêu
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
                        {moderation.targetPreview.content}
                      </p>
                    </div>
                  ) : null}
                </section>

                <section className="space-y-3 rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                  <h3 className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                    Chi tiết vi phạm
                  </h3>

                  {violations.length > 0 ? (
                    <div className="space-y-2">
                      {violations.map((violation, index) => (
                        <div
                          key={`${violation.category}-${index}`}
                          className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/70"
                        >
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {violation.category}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                            {violation.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Không có vi phạm được ghi nhận.
                    </p>
                  )}
                </section>

                <section className="space-y-3 rounded-2xl border border-sky-200/70 bg-sky-50/60 p-4 shadow-sm dark:border-sky-900/50 dark:bg-sky-950/20">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                      Gửi kháng cáo
                    </h3>
                    {hasPendingAppeal ? (
                      <Badge className="border-amber-200/70 bg-amber-50/80 text-amber-700 hover:bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                        Đang chờ xử lý
                      </Badge>
                    ) : null}
                  </div>

                  {hasPendingAppeal ? (
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                      Bản ghi này đã có kháng cáo chờ xử lý. Bạn chưa thể gửi
                      thêm kháng cáo mới.
                    </p>
                  ) : (
                    <>
                      <Textarea
                        value={appealReason}
                        onChange={(event) => {
                          setAppealReason(event.target.value);
                        }}
                        rows={4}
                        placeholder="Nhập lý do kháng cáo của bạn…"
                        className="resize-none border-slate-200/80 bg-white/90 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
                      />

                      <div className="flex justify-end">
                        <Button
                          onClick={() => {
                            void handleSubmitAppeal();
                          }}
                          disabled={
                            appealMutation.isPending ||
                            appealReason.trim().length === 0 ||
                            !moderation
                          }
                          className="rounded-xl bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
                        >
                          {appealMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Gửi kháng cáo
                        </Button>
                      </div>
                    </>
                  )}
                </section>

                {detailQuery.data?.appeals?.length ? (
                  <section className="space-y-3 rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                    <h3 className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                      Kháng nghị liên quan
                    </h3>

                    <div className="space-y-2">
                      {detailQuery.data.appeals.map((appeal) => (
                        <div
                          key={appeal.id}
                          className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/70"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className="border-slate-200/80 bg-white/80 text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300"
                            >
                              {appeal.status}
                            </Badge>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {formatDateTime(appeal.createdAt)}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                            {appeal.reason}
                          </p>
                          {appeal.reviewNote ? (
                            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                              {appeal.reviewNote}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
