import { Badge } from '@/components/ui/badge';

type Props = {
  decision?: string | null;
};

export function ModerationDecisionBadge({ decision }: Props) {
  if (!decision) {
    return (
      <Badge className="border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-100">
        Tự động (AI)
      </Badge>
    );
  }

  if (decision === 'VIOLATION') {
    return (
      <Badge className="border border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-100">
        Thủ công (Vi phạm)
      </Badge>
    );
  }

  if (decision === 'NO_VIOLATION') {
    return (
      <Badge className="border border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        Thủ công (Khôi phục)
      </Badge>
    );
  }

  return (
    <Badge className="border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-100">
      {decision}
    </Badge>
  );
}

