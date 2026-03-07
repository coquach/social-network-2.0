import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { GroupSummaryDTO } from '@/models/group/groupDTO';
import { GroupPrivacy } from '@/models/group/enums/group-privacy.enum';

export function SuggestionGroupItem({
  group,
  onPick,
}: {
  group: GroupSummaryDTO;
  onPick: (group: GroupSummaryDTO) => void;
}) {
  const groupPrivacy =
    group.privacy === GroupPrivacy.PUBLIC
      ? 'Công khai'
      : group.privacy === GroupPrivacy.PRIVATE
      ? 'Riêng tư'
      : 'Bí mật';

  return (
    <button
      type="button"
      onClick={() => onPick(group)}
      className="w-full px-3 py-2 text-left hover:bg-muted/60 transition flex items-center gap-3"
    >
      <Avatar className="h-9 w-9">
        <AvatarImage src={group.avatarUrl} alt={group.name} />
        <AvatarFallback>
          {group.name?.charAt(0).toUpperCase() ?? 'G'}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{group.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {groupPrivacy} • {group.members} thành viên
        </div>
      </div>
    </button>
  );
}
