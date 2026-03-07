// components/chat/group-conversation-avatar.tsx
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import clsx from 'clsx';

import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { useGetUser } from '@/hooks/use-user-hook';

type GroupConversationAvatarProps = {
  conversation: ConversationDTO;
  className?: string;

  /** Kích thước avatar group (px). Default = 40 (h-10 w-10 như hiện tại) */
  size?: number;
};

export const GroupAvatar = ({
  conversation,
  className,
  size = 40,
}: GroupConversationAvatarProps) => {
  // lấy tối đa 3 member
  const otherMemberIds = conversation.participants.slice(0, 3);

  const [memberId1, memberId2, memberId3] = otherMemberIds;
  const { data: member1 } = useGetUser(memberId1 ?? '');
  const { data: member2 } = useGetUser(memberId2 ?? '');
  const { data: member3 } = useGetUser(memberId3 ?? '');

  const availableCount = otherMemberIds.length;

  // ====== scale theo size ======
  const containerPx = size; // default 40
  const circlePx = Math.round(containerPx * 0.7); // 40 -> 28 ~ h-7 w-7
  const leftStepPx = Math.round(containerPx * 0.3); // 40 -> 12 ~ left-3
  const borderPx = Math.max(1, Math.round(containerPx * 0.05)); // 40 -> 2
  const fontPx = Math.max(8, Math.round(containerPx * 0.25)); // 40 -> 10
  // =============================

  // Nếu có groupAvatar riêng thì dùng luôn
  if (conversation.groupAvatar) {
    const initial =
      (conversation.groupName ?? 'G').trim().charAt(0).toUpperCase() || 'G';

    return (
      <Avatar
        className={clsx(className)}
        style={{ width: containerPx, height: containerPx }}
      >
        <AvatarImage
          src={conversation.groupAvatar.url}
          alt={conversation.groupName ?? 'Group'}
        />
        <AvatarFallback style={{ fontSize: Math.round(containerPx * 0.35) }}>
          {initial}
        </AvatarFallback>
      </Avatar>
    );
  }

  const circles = [
    { user: member1, id: memberId1, left: 0, z: 30 },
    { user: member2, id: memberId2, left: leftStepPx, z: 20 },
    { user: member3, id: memberId3, left: leftStepPx * 2, z: 10 },
  ];

  const getInitial = (u?: { firstName?: string; lastName?: string }) => {
    if (!u) {
      return (
        (conversation.groupName ?? 'G').trim().charAt(0).toUpperCase() || 'G'
      );
    }
    const full = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    return (full || 'U').trim().charAt(0).toUpperCase();
  };

  const getAvatarUrl = (u?: { avatarUrl?: string }) =>
    u?.avatarUrl ?? undefined;

  return (
    <div
      className={clsx('relative', className)}
      style={{ width: containerPx, height: containerPx }}
    >
      {circles.map((c, index) => {
        if (index >= availableCount) return null;

        const u = c.user;
        const url = getAvatarUrl(u);
        const initial = getInitial(u);

        return (
          <Avatar
            key={c.id ?? `group-slot-${index}`}
            className="absolute top-1/2 -translate-y-1/2 bg-gray-200"
            style={{
              width: circlePx,
              height: circlePx,
              left: c.left,
              zIndex: c.z,
              borderWidth: borderPx,
              borderColor: 'white',
              fontSize: fontPx,
              lineHeight: 1,
            }}
          >
            {url && <AvatarImage src={url} alt={initial} />}
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        );
      })}

      {/* Không có member nào khác → fallback 1 avatar chữ cái tên nhóm */}
      {availableCount === 0 && (
        <Avatar
          className="bg-gray-200"
          style={{
            width: containerPx,
            height: containerPx,
            borderWidth: 1,
            borderColor: 'white',
            fontSize: Math.round(containerPx * 0.35),
          }}
        >
          <AvatarFallback>
            {(conversation.groupName ?? 'G').trim().charAt(0).toUpperCase() ||
              'G'}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
