'use client';

import { UserDTO } from '@/models/user/userDTO';
import { AvatarWithStatus } from '@/components/avatar';

export function ConversationUserResult({
  user,
  onPick,
  disabled = false,
}: {
  user: UserDTO;
  onPick: (u: UserDTO) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onPick(user)}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed transition text-left"
      aria-label={`Mở trò chuyện với ${user.firstName} ${user.lastName}`}
    >
      <AvatarWithStatus userId={user.id} />
    </button>
  );
}
