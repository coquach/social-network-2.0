import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserDTO } from '@/models/user/userDTO';

export function SuggestionUserItem({
  user,
  onPick,
}: {
  user: UserDTO;
  onPick: (user: UserDTO) => void;
}) {
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  const displayName = fullName || user.email;

  return (
    <button
      type="button"
      onClick={() => onPick(user)}
      className="w-full px-3 py-2 text-left hover:bg-muted/60 transition flex items-center gap-3"
    >
      <Avatar className="h-9 w-9">
        <AvatarImage src={user.avatarUrl} alt={displayName} />
        <AvatarFallback>
          {displayName?.charAt(0)?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{displayName}</div>
        {/* <div className="text-xs text-muted-foreground truncate">
          {user.email}
        </div> */}
      </div>
    </button>
  );
}
