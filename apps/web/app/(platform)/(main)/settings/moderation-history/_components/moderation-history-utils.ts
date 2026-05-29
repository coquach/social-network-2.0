import { format } from 'date-fns';

import type { ContentModerationDTO } from '@repo/shared';

const targetLabelMap: Record<string, string> = {
  POST: 'Bài viết',
  COMMENT: 'Bình luận',
  SHARE: 'Chia sẻ',
};

const decisionLabelMap: Record<string, string> = {
  APPROVED: 'Đã phê duyệt',
  REJECTED: 'Từ chối',
  PENDING: 'Chờ xử lý',
  NO_VIOLATION: 'Không vi phạm',
  VIOLATION: 'Vi phạm',
};

const severityLabelMap: Record<string, string> = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
  CRITICAL: 'Nghiêm trọng',
};

export const formatDateTime = (value?: Date | string) => {
  if (!value) return 'Không rõ thời gian';

  return format(new Date(value), 'dd/MM/yyyy HH:mm');
};

export const formatLabel = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/^[a-zÀ-ỹ]/, (match) => match.toUpperCase());

export const getTargetLabel = (targetType: string) =>
  targetLabelMap[targetType] ?? formatLabel(targetType);

export const getDecisionLabel = (decision?: string) => {
  if (!decision) return 'Chờ xử lý';

  return decisionLabelMap[decision] ?? formatLabel(decision);
};

export const getSeverityLabel = (severity: string) =>
  severityLabelMap[severity] ?? formatLabel(severity);

export const getSeverityToneClassName = (severity: string) => {
  const normalized = severity.toUpperCase();

  if (normalized === 'CRITICAL' || normalized === 'HIGH') {
    return 'border-rose-200/70 bg-rose-50/80 text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300';
  }

  if (normalized === 'MEDIUM') {
    return 'border-amber-200/70 bg-amber-50/80 text-amber-700 hover:bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300';
  }

  return 'border-slate-200/70 bg-slate-50/80 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300';
};

export const getDecisionToneClassName = (decision?: string) => {
  const normalized = decision?.toUpperCase();

  if (normalized === 'NO_VIOLATION') {
    return 'border-emerald-200/70 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300';
  }

  if (normalized === 'VIOLATION') {
    return 'border-rose-200/70 bg-rose-50/80 text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300';
  }

  if (normalized === 'APPROVED') {
    return 'border-emerald-200/70 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300';
  }

  if (normalized === 'REJECTED') {
    return 'border-rose-200/70 bg-rose-50/80 text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300';
  }

  if (normalized === 'PENDING') {
    return 'border-amber-200/70 bg-amber-50/80 text-amber-700 hover:bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300';
  }

  return 'border-slate-200/70 bg-slate-50/80 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300';
};

export const getViolationStatusLabel = (hasViolations: boolean) =>
  hasViolations ? 'Vi phạm' : 'Không vi phạm';

export const getViolationStatusToneClassName = (hasViolations: boolean) =>
  hasViolations
    ? 'border-rose-200/70 bg-rose-50/80 text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
    : 'border-emerald-200/70 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300';

export const getModerationTypeLabel = (item: ContentModerationDTO) =>
  item.displayMessage || item.violations[0]?.category || 'Bản ghi kiểm duyệt';

export const getReasonLabel = (item: ContentModerationDTO) => {
  const reasons = item.violations
    .map((violation) => violation.reason)
    .filter(Boolean);

  if (reasons.length > 0) {
    return reasons.join(' · ');
  }

  return item.displayMessage || 'Không có mô tả lý do';
};

export const getModeratorLabel = (item: ContentModerationDTO) => {
  const moderation = item as ContentModerationDTO & {
    moderatorName?: string;
    moderator?: string;
    reviewedBy?: string;
    reviewedByName?: string;
  };

  return (
    moderation.moderatorName ??
    moderation.reviewedByName ??
    moderation.reviewedBy ??
    moderation.moderator ??
    null
  );
};

export const normalizeText = (value: unknown) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return null;
  }
};

export const getTargetSummary = (target: unknown) => {
  if (!target || typeof target !== 'object') {
    return 'Không có dữ liệu đích';
  }

  const record = target as Record<string, unknown>;
  const fields = [record.title, record.content, record.text, record.message]
    .map(normalizeText)
    .filter(Boolean) as string[];

  if (fields.length > 0) {
    return fields[0];
  }

  return normalizeText(record) ?? 'Không có dữ liệu đích';
};

export function normalizeViolations(violations: unknown) {
  if (Array.isArray(violations)) {
    return violations.filter(
      (item): item is { category: string; reason: string } =>
        Boolean(item) && typeof item === 'object',
    ) as Array<{ category: string; reason: string }>;
  }

  return [];
}
