import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Heart,
  LucideIcon,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import { DashboardInsightItemDto } from '@repo/shared';

export const getInsightToneStyles = (
  tone: DashboardInsightItemDto['tone'],
): {
  card: string;
  leftBorder: string;
  iconWrap: string;
  toneBadge: string;
} => {
  if (tone === 'critical') {
    return {
      card: 'bg-rose-50/70 border-rose-100',
      leftBorder: 'border-l-rose-500',
      iconWrap: 'bg-rose-100 text-rose-700',
      toneBadge: 'border-rose-200 bg-rose-100 text-rose-700',
    };
  }

  if (tone === 'warning') {
    return {
      card: 'bg-amber-50/70 border-amber-100',
      leftBorder: 'border-l-amber-500',
      iconWrap: 'bg-amber-100 text-amber-700',
      toneBadge: 'border-amber-200 bg-amber-100 text-amber-700',
    };
  }

  if (tone === 'positive') {
    return {
      card: 'bg-emerald-50/70 border-emerald-100',
      leftBorder: 'border-l-emerald-500',
      iconWrap: 'bg-emerald-100 text-emerald-700',
      toneBadge: 'border-emerald-200 bg-emerald-100 text-emerald-700',
    };
  }

  return {
    card: 'bg-slate-50/80 border-slate-200',
    leftBorder: 'border-l-slate-400',
    iconWrap: 'bg-slate-200 text-slate-700',
    toneBadge: 'border-slate-300 bg-slate-200 text-slate-700',
  };
};

export const getInsightIcon = (
  type: DashboardInsightItemDto['type'],
): LucideIcon => {
  if (type === 'HIGH_RISK') return ShieldAlert;
  if (type === 'HIGH_NEGATIVITY') return AlertTriangle;
  if (type === 'NEGATIVE_STREAK') return TrendingUp;
  if (type === 'DETERIORATING_TREND') return ArrowUpRight;
  if (type === 'RECOVERING_TREND') return ArrowDownRight;
  if (type === 'NORMALIZING') return TrendingDown;
  if (type === 'POSITIVE_STATE') return Sparkles;
  if (type === 'ABOVE_BASELINE') return Activity;
  if (type === 'HIGH_VOLATILITY') return Activity;
  if (type === 'STABLE_STATE') return Heart;
  return Activity;
};

export const getInsightRecommendation = (
  type: DashboardInsightItemDto['type'],
) => {
  if (type === 'NEGATIVE_STREAK') {
    return 'Bạn có thể nghỉ ngắn, làm một hoạt động thư giãn nhẹ hoặc chia sẻ với người mình tin tưởng.';
  }

  if (type === 'HIGH_RISK' || type === 'HIGH_NEGATIVITY') {
    return 'Hãy giảm tác nhân gây áp lực hôm nay và ưu tiên một hoạt động phục hồi trong vài giờ tới.';
  }

  if (type === 'DETERIORATING_TREND' || type === 'ABOVE_BASELINE') {
    return 'Tâm trạng đang lệch khỏi mức nền. Một routine reset ngắn có thể giúp bạn ổn định lại nhịp trong ngày.';
  }

  if (type === 'HIGH_VOLATILITY') {
    return 'Biến động lớn đang xuất hiện. Hãy giữ lịch sinh hoạt ổn định và tránh dồn nhiều việc nặng cùng lúc.';
  }

  if (
    type === 'RECOVERING_TREND' ||
    type === 'NORMALIZING' ||
    type === 'POSITIVE_STATE' ||
    type === 'STABLE_STATE'
  ) {
    return 'Bạn đang đi đúng hướng. Hãy duy trì thói quen và nhịp hiện tại.';
  }

  return 'Hãy xem insight này như một gợi ý để điều chỉnh chủ động cho các hành động tiếp theo.';
};

export const getRiskBadgeStyles = (
  status: 'normal' | 'warning' | 'critical',
) => {
  if (status === 'critical') {
    return 'border-rose-200 bg-rose-100 text-rose-700';
  }

  if (status === 'warning') {
    return 'border-amber-200 bg-amber-100 text-amber-700';
  }

  return 'border-emerald-200 bg-emerald-100 text-emerald-700';
};
