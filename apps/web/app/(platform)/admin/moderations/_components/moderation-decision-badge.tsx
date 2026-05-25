import { Badge } from '@/components/ui/badge';

type Props = {
  decision?: string;
};

export function ModerationDecisionBadge({ decision }: Props) {
  if (!decision) {
    return (
      <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">
        Tự động
      </Badge>
    );
  }

  if (decision === 'VIOLATION') {
    return (
      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
        Vi phạm
      </Badge>
    );
  }

  if (decision === 'NO_VIOLATION') {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        Không vi phạm
      </Badge>
    );
  }

  return (
    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
      Không vi phạm
    </Badge>
  );
}
