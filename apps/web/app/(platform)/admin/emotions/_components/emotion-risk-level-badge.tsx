import { Badge } from '@/components/ui/badge';
import { RiskLevel } from '@/models/emotion/adminEmotionDTO';

type Props = {
  level?: RiskLevel | string;
};

const riskMeta: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  normal: {
    label: 'Bình thường',
    className:
      'border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100',
  },

  warning: {
    label: 'Cảnh báo',
    className:
      'border border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-100',
  },

  high: {
    label: 'Cao',
    className:
      'border border-orange-200 bg-orange-100 text-orange-700 hover:bg-orange-100',
  },

  critical: {
    label: 'Nguy hiểm',
    className:
      'border border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-100',
  },
};

export function EmotionRiskLevelBadge({ level }: Props) {
  if (!level) {
    return (
      <Badge className="border border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-100">
        Bình thường
      </Badge>
    );
  }

  const normalizedLevel = level.toLowerCase();

  const meta = riskMeta[normalizedLevel] ?? {
    label: level,
    className:
      'border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100',
  };

  return <Badge className={meta.className}>{meta.label}</Badge>;
}
