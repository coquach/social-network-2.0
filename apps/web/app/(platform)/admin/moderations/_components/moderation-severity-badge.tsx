import { Badge } from '@/components/ui/badge';

type Props = {
  severity?: string;
};

const severityMeta: Record<string, { label: string; className: string }> = {
  NONE: {
    label: 'Không có',
    className: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
  },
  LOW: {
    label: 'Thấp',
    className: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
  },
  MEDIUM: {
    label: 'Trung bình',
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  },
  HIGH: {
    label: 'Cao',
    className: 'bg-rose-100 text-rose-700 hover:bg-rose-100',
  },
};

export function ModerationSeverityBadge({ severity }: Props) {
  if (!severity) {
    return (
      <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">
        Chưa có
      </Badge>
    );
  }

  const meta = severityMeta[severity];

  return <Badge className={meta.className}>{meta.label}</Badge>;
}
