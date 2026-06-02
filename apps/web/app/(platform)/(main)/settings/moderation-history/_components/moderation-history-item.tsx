'use client';

import { Clock3, ChevronRight } from 'lucide-react';

import type { ContentModerationDTO } from '@repo/shared';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import {
  formatDateTime,
  getDecisionLabel,
  getDecisionToneClassName,
  getModerationTypeLabel,
  getReasonLabel,
  getSeverityLabel,
  getSeverityToneClassName,
  getTargetLabel,
} from './moderation-history-utils';

function SeverityBadge({ severity }: { severity: string }) {
  const normalized = severity.toUpperCase();

  return (
    <Badge
      className={cn('gap-1.5 border', getSeverityToneClassName(normalized))}
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
      className={cn('gap-1.5 border', getDecisionToneClassName(normalized))}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current/80" />
      {getDecisionLabel(normalized)}
    </Badge>
  );
}

export function ModerationHistoryItem({
  item,
  onOpenDetail,
}: {
  item: ContentModerationDTO;
  onOpenDetail: () => void;
}) {
  const targetPreview = item.targetPreview?.content;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-200/70 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-sky-900/70 sm:p-4">
      <div className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-sky-400 via-cyan-400 to-sky-500" />

      <div className="space-y-3.5 pl-2.5 sm:space-y-4">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3.5">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <Badge className="border-sky-200/70 bg-sky-50/80 text-sky-700 hover:bg-sky-50 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300">
                {getModerationTypeLabel(item)}
              </Badge>
              <Badge
                variant="outline"
                className="border-slate-200/80 bg-white/80 text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300"
              >
                {getTargetLabel(item.targetType)}
              </Badge>
              <SeverityBadge severity={item.maxSeverity} />
              <DecisionBadge decision={item.finalDecision} />
            </div>

            <h3 className="line-clamp-1 text-sm font-semibold tracking-tight text-slate-900 text-pretty dark:text-slate-100">
              {item.displayMessage || 'Bản ghi kiểm duyệt'}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 sm:shrink-0 sm:justify-end sm:pt-1">
            <Clock3 className="h-3.5 w-3.5" />
            <span className="tabular-nums">
              {formatDateTime(item.createdAt)}
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/80 px-3.5 py-2.5 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
            <p className="line-clamp-3 whitespace-pre-line wrap-break-word">
              {getReasonLabel(item)}
            </p>
          </div>

          {targetPreview ? (
            <div className="rounded-xl border border-slate-200/70 bg-white/80 px-3.5 py-2.5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Preview mục tiêu
              </p>
              <p className="line-clamp-2 whitespace-pre-line wrap-break-word">
                {targetPreview}
              </p>
            </div>
          ) : null}

          {item.violations.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {item.violations.map((violation, index) => (
                <Badge
                  key={`${violation.category}-${index}`}
                  variant="outline"
                  className="border-slate-200/80 bg-white/80 text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300"
                >
                  {violation.category}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 sm:flex-wrap">
              {item.violations.length > 0 ? (
                <span className="truncate">
                  {item.violations.length} danh mục vi phạm
                </span>
              ) : (
                <span>Không có danh mục vi phạm</span>
              )}
            </div>

            <Button
              variant="ghost"
              className="h-9 justify-between rounded-xl px-3 text-sky-700 hover:bg-sky-50 hover:text-sky-800 dark:text-sky-300 dark:hover:bg-sky-950/40 dark:hover:text-sky-200 sm:ml-auto sm:min-w-32"
              onClick={onOpenDetail}
            >
              Xem chi tiết
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
