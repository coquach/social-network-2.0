'use client';

import * as React from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

import { AppealStatus } from '@/models/moderation/enums/moderationEnum';
import { ModerationAppealResponseDTO } from '@/models/moderation/moderationDTO';

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

import { useAdminModerationRecordDetail } from '@/hooks/use-admin-moderation';
import { formatDateVN } from '@/utils/user.utils';
import { ModerationDecisionBadge } from './moderation-decision-badge';
import { ModerationSeverityBadge } from './moderation-severity-badge';
import { ModerationStatusBadge } from './moderation-status-badge';
import { ModerationTargetDetail } from './moderation-target-detail';

type ModerationViolationItem = {
  category: string;
  reason: string;
};

const normalizeViolations = (
  violations: unknown,
): ModerationViolationItem[] => {
  if (Array.isArray(violations)) {
    return violations.filter(
      (item): item is ModerationViolationItem =>
        Boolean(item) && typeof item === 'object',
    ) as ModerationViolationItem[];
  }

  if (!violations) {
    return [];
  }

  if (typeof violations === 'string') {
    try {
      return normalizeViolations(JSON.parse(violations));
    } catch {
      return [];
    }
  }

  if (typeof violations === 'object') {
    return Object.entries(violations as Record<string, unknown>).map(
      ([category, reason]) => ({
        category,
        reason: String(reason ?? ''),
      }),
    );
  }

  return [];
};

type Props = {
  moderationId: string | null;
  appeal: ModerationAppealResponseDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproveAppeal: (reviewNote?: string) => void;
  onRejectAppeal: (reviewNote?: string) => void;
  onRestoreContent: () => void;
  reviewLoading?: boolean;
  restoreLoading?: boolean;
};

const targetLabels: Record<string, string> = {
  POST: 'Bài viết',
  SHARE: 'Chia sẻ',
  COMMENT: 'Bình luận',
};

const confidenceText = (value?: number) => {
  if (typeof value !== 'number') return 'N/A';
  const normalized = value <= 1 ? value * 100 : value;
  return `${Math.round(normalized)}%`;
};

export function ModerationDetailDrawer({
  moderationId,
  appeal,
  open,
  onOpenChange,
  onApproveAppeal,
  onRejectAppeal,
  onRestoreContent,
  reviewLoading,
  restoreLoading,
}: Props) {
  const [reviewNote, setReviewNote] = React.useState('');
  const detailQuery = useAdminModerationRecordDetail(moderationId ?? undefined);

  React.useEffect(() => {
    setReviewNote(appeal?.reviewNote ?? '');
  }, [appeal?.id, appeal?.reviewNote]);

  const moderation = detailQuery.data?.moderation;
  const target = detailQuery.data?.target ?? null;
  const violations = React.useMemo(
    () => normalizeViolations(moderation?.violations),
    [moderation?.violations],
  );
  const canReviewAppeal = appeal?.status === AppealStatus.PENDING;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-l border-sky-100 p-0 sm:max-w-180"
      >
        <SheetHeader className="border-b border-slate-100">
          <SheetTitle className="text-sky-600">Chi tiết kiểm duyệt</SheetTitle>
          <SheetDescription>
            Xem nội dung vi phạm, lý do kiểm duyệt và xử lý kháng nghị.
          </SheetDescription>
        </SheetHeader>

        <div className="flex h-full min-h-0 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto p-4 pb-28">
            {detailQuery.isLoading ? (
              <div className="flex items-center justify-center rounded-xl border border-slate-100 bg-white p-6 text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải chi
                tiết...
              </div>
            ) : null}

            {!detailQuery.isLoading && moderation ? (
              <>
                <section className="space-y-3 rounded-xl border border-sky-100 bg-slate-50/60 p-4">
                  <h3 className="text-sm font-semibold text-sky-700">
                    Thông tin kiểm duyệt
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">
                      {targetLabels[moderation.targetType] ??
                        moderation.targetType}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-700"
                    >
                      {moderation.isViolation ? 'Vi phạm' : 'Không vi phạm'}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-700"
                    >
                      #{moderation.id}
                    </Badge>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-100 bg-white p-3">
                      <p className="text-xs text-slate-500">ID người dùng</p>
                      <p className="text-sm font-medium text-slate-700">
                        {moderation.userId}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-white p-3">
                      <p className="text-xs text-slate-500">Id nội dung</p>
                      <p className="text-sm font-medium text-slate-700">
                        {moderation.targetId}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-white p-3">
                      <p className="text-xs text-slate-500">
                        Mức độ nghiêm trọng
                      </p>
                      <ModerationSeverityBadge
                        severity={moderation.maxSeverity}
                      />
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-white p-3">
                      <p className="text-xs text-slate-500">Quyết định</p>
                      <ModerationDecisionBadge
                        decision={moderation.finalDecision}
                      />
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-white p-3">
                      <p className="text-xs text-slate-500">Độ tin cậy</p>
                      <p className="text-sm font-medium text-slate-700">
                        {confidenceText(moderation.confidence)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-white p-3">
                      <p className="text-xs text-slate-500">Ngày tạo</p>
                      <p className="text-sm font-medium text-slate-700">
                        {formatDateVN(moderation.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-100 bg-white p-3">
                    <p className="text-xs text-slate-500">
                      Nội dung kiểm duyệt
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                      {moderation.displayMessage}
                    </p>
                  </div>
                </section>

                <section className="space-y-3 rounded-xl border border-slate-100 bg-white p-4">
                  <h3 className="text-sm font-semibold text-sky-700">
                    Chi tiết vi phạm
                  </h3>
                  {violations.length ? (
                    <ul className="space-y-2">
                      {violations.map(
                        (violation: ModerationViolationItem, index: number) => (
                          <li
                            key={`${violation.category}-${index}`}
                            className="rounded-md border border-slate-100 bg-slate-50 p-3"
                          >
                            <p className="font-medium text-slate-800">
                              {violation.category}
                            </p>
                            <p className="text-sm text-slate-600">
                              {violation.reason}
                            </p>
                          </li>
                        ),
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Không có vi phạm được ghi nhận.
                    </p>
                  )}
                </section>

                <ModerationTargetDetail
                  targetType={moderation.targetType}
                  target={target}
                />

                {appeal ? (
                  <section className="space-y-3 rounded-xl border border-slate-100 bg-white p-4">
                    <h3 className="text-sm font-semibold text-sky-700">
                      Thông tin kháng nghị
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-slate-100 p-3">
                        <p className="text-xs text-slate-500">ID kháng nghị</p>
                        <p className="text-sm font-medium text-slate-700">
                          {appeal.id}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-100 p-3">
                        <p className="text-xs text-slate-500">ID kiểm duyệt</p>
                        <p className="text-sm font-medium text-slate-700">
                          {appeal.moderationId}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-100 p-3">
                        <p className="text-xs text-slate-500">ID người dùng</p>
                        <p className="text-sm font-medium text-slate-700">
                          {appeal.userId}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-100 p-3">
                        <p className="text-xs text-slate-500">Trạng thái</p>
                        <ModerationStatusBadge status={appeal.status} />
                      </div>
                      <div className="rounded-lg border border-slate-100 p-3">
                        <p className="text-xs text-slate-500">Ngày tạo</p>
                        <p className="text-sm font-medium text-slate-700">
                          {formatDateVN(appeal.createdAt)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-100 p-3">
                        <p className="text-xs text-slate-500">Ngày xem xét</p>
                        <p className="text-sm font-medium text-slate-700">
                          {appeal.reviewedAt
                            ? formatDateVN(appeal.reviewedAt)
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-100 p-3">
                      <p className="text-xs text-slate-500">Lý do kháng nghị</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                        {appeal.reason}
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-100 p-3">
                      <p className="text-xs text-slate-500">Ghi chú xem xét</p>
                      <Textarea
                        value={reviewNote}
                        onChange={(event) => setReviewNote(event.target.value)}
                        rows={3}
                        placeholder="Ghi chú xử lý kháng nghị..."
                        disabled={!canReviewAppeal}
                        className="border-slate-200 focus-visible:ring-sky-200"
                      />
                    </div>
                  </section>
                ) : null}
              </>
            ) : null}
          </div>

          <Separator />
          <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-white p-4">
            {appeal ? (
              <>
                <Button
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => onApproveAppeal(reviewNote)}
                  disabled={reviewLoading || !canReviewAppeal}
                >
                  {reviewLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  Chấp thuận kháng nghị
                </Button>

                <Button
                  variant="outline"
                  className="border-rose-200 text-rose-700 hover:bg-rose-50"
                  onClick={() => onRejectAppeal(reviewNote)}
                  disabled={reviewLoading || !canReviewAppeal}
                >
                  {reviewLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Từ chối kháng nghị
                </Button>
              </>
            ) : null}

            {moderation?.isViolation ? (
              <Button
                className="bg-sky-600 text-white hover:bg-sky-700"
                onClick={onRestoreContent}
                disabled={restoreLoading}
              >
                {restoreLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Khôi phục nội dung
              </Button>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
