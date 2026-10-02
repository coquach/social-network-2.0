import { Badge } from '@/components/ui/badge';
import { ModerationAction } from '@/models/moderation/enums/moderationEnum';

type Props = {
  action?: string;
};

export function ModerationActionBadge({ action }: Props) {
  switch (action) {
    case ModerationAction.HARD_BLOCK:
      return (
        <Badge className="border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50">
          Chặn nội dung
        </Badge>
      );
    case ModerationAction.ALLOW_WITH_WARNING:
      return (
        <Badge className="border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50">
          Cảnh báo
        </Badge>
      );
    case ModerationAction.ALLOW_WITH_SUPPORT:
      return (
        <Badge className="border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-50">
          Hỗ trợ tâm lý
        </Badge>
      );
    case ModerationAction.ALLOW:
    default:
      return (
        <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
          Cho phép
        </Badge>
      );
  }
}
