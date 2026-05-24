import { EmotionRiskLevel, EmotionTrendWindow } from '@repo/shared';

const relativeFormatter = new Intl.RelativeTimeFormat('vi', {
  numeric: 'auto',
});

export const clampPercent = (value?: number | null) => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
};

export const toPercentNumber = (
  value?: number | null,
  source: 'ratio' | 'percent' | 'auto' = 'auto',
) => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return null;
  }

  if (source === 'ratio') {
    return value * 100;
  }

  if (source === 'percent') {
    return value;
  }

  return Math.abs(value) <= 1 ? value * 100 : value;
};

export const formatPercentage = (
  value?: number | null,
  options?: {
    source?: 'ratio' | 'percent' | 'auto';
    maximumFractionDigits?: number;
  },
) => {
  const percent = toPercentNumber(value, options?.source ?? 'auto');

  if (percent === null) {
    return 'Chưa có dữ liệu';
  }

  return `${percent.toFixed(options?.maximumFractionDigits ?? 1)}%`;
};

export const formatSignedPercentage = (
  value?: number | null,
  source: 'ratio' | 'percent' | 'auto' = 'auto',
) => {
  const percent = toPercentNumber(value, source);

  if (percent === null) {
    return 'Chưa có dữ liệu';
  }

  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(1)}%`;
};

export const formatRiskLevel = (riskLevel?: string | null) => {
  const normalized = (riskLevel ?? '').toLowerCase() as EmotionRiskLevel;

  if (normalized === 'high') return 'Nguy cấp';
  if (normalized === 'medium') return 'Cảnh báo';
  if (normalized === 'low') return 'Theo dõi';
  return 'Bình thường';
};

export const formatWindowLabel = (window: EmotionTrendWindow) => {
  if (window === '1d') return '24 giờ';
  if (window === '30d') return '30 ngày';
  return '7 ngày';
};

export const formatMoodTrend = (delta?: number | null) => {
  const percent = toPercentNumber(delta, 'auto');

  if (percent === null) {
    return {
      label: 'Ổn định',
      hint: 'Chưa đủ tín hiệu để xác định xu hướng.',
      direction: 'flat' as const,
      deltaText: 'Chưa có dữ liệu',
    };
  }

  if (percent > 0.5) {
    return {
      label: 'Đang xấu đi',
      hint: 'Mức tiêu cực tăng so với giai đoạn trước.',
      direction: 'up' as const,
      deltaText: `+${percent.toFixed(1)}% so với kỳ trước`,
    };
  }

  if (percent < -0.5) {
    return {
      label: 'Đang cải thiện',
      hint: 'Mức tiêu cực đã giảm so với giai đoạn trước.',
      direction: 'down' as const,
      deltaText: `${percent.toFixed(1)}% so với kỳ trước`,
    };
  }

  return {
    label: 'Ổn định',
    hint: 'Biến động nhỏ và đang trong ngưỡng bình thường.',
    direction: 'flat' as const,
    deltaText: `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}% so với kỳ trước`,
  };
};

export const formatRelativeTime = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);
  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);

  if (Math.abs(diffMinutes) < 60) {
    return relativeFormatter.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeFormatter.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  return relativeFormatter.format(diffDays, 'day');
};
