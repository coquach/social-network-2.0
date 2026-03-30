import type { ConversationDTO, ConversationWithParticipantsDTO } from '@repo/shared';
import { useUser } from '@repo/shared';
import { Avatar } from 'heroui-native/avatar';
import React from 'react';
import { View } from 'react-native';

import { cn } from '~/lib/cn';

type ChatAvatarSize = 'sm' | 'md' | 'lg';

type ChatAvatarProps = {
  name: string;
  imageUrl?: string;
  size?: ChatAvatarSize;
  online?: boolean;
};

type GroupChatAvatarProps = {
  conversation?: ConversationDTO | ConversationWithParticipantsDTO | null;
  size?: ChatAvatarSize;
};

type AvatarVisualSize = {
  textClassName: string;
  dotClassName: string;
  groupContainerPx: number;
  groupCirclePx: number;
  groupStepPx: number;
  groupBorderPx: number;
  groupFontPx: number;
};

const avatarSizes: Record<ChatAvatarSize, AvatarVisualSize> = {
  sm: {
    textClassName: 'text-xs',
    dotClassName: '-bottom-0.5 -right-0.5 h-3.5 w-3.5',
    groupContainerPx: 40,
    groupCirclePx: 28,
    groupStepPx: 12,
    groupBorderPx: 2,
    groupFontPx: 10,
  },
  md: {
    textClassName: 'text-sm',
    dotClassName: '-bottom-0.5 -right-0.5 h-4 w-4',
    groupContainerPx: 48,
    groupCirclePx: 34,
    groupStepPx: 14,
    groupBorderPx: 2,
    groupFontPx: 12,
  },
  lg: {
    textClassName: 'text-base',
    dotClassName: '-bottom-1 -right-1 h-5 w-5',
    groupContainerPx: 56,
    groupCirclePx: 39,
    groupStepPx: 17,
    groupBorderPx: 3,
    groupFontPx: 14,
  },
};

const getInitials = (name: string) => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return '?';
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
};

const getSingleInitial = (name?: string) => {
  return getInitials(name ?? '?').charAt(0) || '?';
};

type AvatarPrimitiveProps = ChatAvatarProps;

function AvatarPrimitive({
  name,
  imageUrl,
  size = 'md',
  online = false,
}: AvatarPrimitiveProps) {
  const visualSize = avatarSizes[size];

  return (
    <View className="relative">
      <Avatar
        alt={name}
        size={size}
        variant="soft"
        color="accent"
        animation="disable-all"
      >
        {imageUrl ? <Avatar.Image source={{ uri: imageUrl }} /> : null}
        <Avatar.Fallback classNames={{ text: visualSize.textClassName }}>
          {getInitials(name)}
        </Avatar.Fallback>
      </Avatar>

      {online ? (
        <View
          className={cn(
            'absolute rounded-full border-2 border-app-surface bg-emerald-500 dark:border-app-surface-dark',
            visualSize.dotClassName,
          )}
        />
      ) : null}
    </View>
  );
}

export function DirectChatAvatar(props: ChatAvatarProps) {
  return <AvatarPrimitive {...props} />;
}

function resolveParticipantDetails(conversation?: ConversationDTO | ConversationWithParticipantsDTO | null) {
  if (!conversation || !('participantDetails' in conversation)) {
    return [];
  }

  return conversation.participantDetails.slice(0, 3);
}

function resolveDisplayName(member?: {
  name?: string;
  firstName?: string;
  lastName?: string;
}) {
  if (!member) {
    return '';
  }

  if (member.name?.trim()) {
    return member.name.trim();
  }

  return `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim();
}

export function GroupChatAvatar({
  conversation,
  size = 'md',
}: GroupChatAvatarProps) {
  const visualSize = avatarSizes[size];
  const participantIds = React.useMemo(
    () => (conversation?.participants ?? []).slice(0, 3),
    [conversation?.participants],
  );
  const participantDetails = React.useMemo(
    () => resolveParticipantDetails(conversation),
    [conversation],
  );

  const [memberId1, memberId2, memberId3] = participantIds;
  const prefetchedMember1 = participantDetails[0];
  const prefetchedMember2 = participantDetails[1];
  const prefetchedMember3 = participantDetails[2];

  const { data: fetchedMember1 } = useUser(memberId1 ?? '', {
    enabled: Boolean(memberId1) && !prefetchedMember1,
  });
  const { data: fetchedMember2 } = useUser(memberId2 ?? '', {
    enabled: Boolean(memberId2) && !prefetchedMember2,
  });
  const { data: fetchedMember3 } = useUser(memberId3 ?? '', {
    enabled: Boolean(memberId3) && !prefetchedMember3,
  });

  const members = [
    prefetchedMember1 ?? fetchedMember1,
    prefetchedMember2 ?? fetchedMember2,
    prefetchedMember3 ?? fetchedMember3,
  ];

  if (conversation?.groupAvatar?.url) {
    return (
      <AvatarPrimitive
        name={conversation.groupName?.trim() || 'Nhom chat'}
        imageUrl={conversation.groupAvatar.url}
        size={size}
      />
    );
  }

  const circles = participantIds.map((memberId, index) => ({
    id: memberId ?? `group-slot-${index}`,
    left: visualSize.groupStepPx * index,
    zIndex: 30 - index * 10,
    member: members[index],
  }));

  return (
    <View
      className="relative"
      style={{
        width: visualSize.groupContainerPx,
        height: visualSize.groupContainerPx,
      }}
    >
      {circles.length > 0 ? (
        circles.map(({ id, left, zIndex, member }) => {
          const memberName = resolveDisplayName(member);
          const fallbackName = memberName || conversation?.groupName?.trim() || 'Group';

          return (
            <Avatar
              key={id}
              alt={fallbackName}
              size="sm"
              variant="soft"
              color="accent"
              animation="disable-all"
              className="absolute overflow-hidden bg-app-surface dark:bg-app-surface-dark"
              style={{
                width: visualSize.groupCirclePx,
                height: visualSize.groupCirclePx,
                top: Math.round((visualSize.groupContainerPx - visualSize.groupCirclePx) / 2),
                left,
                zIndex,
                borderWidth: visualSize.groupBorderPx,
                borderColor: '#ffffff',
              }}
            >
              {member?.avatarUrl ? <Avatar.Image source={{ uri: member.avatarUrl }} /> : null}
              <Avatar.Fallback
                classNames={{ text: 'text-app-primary dark:text-app-primary-dark' }}
                styles={{ text: { fontSize: visualSize.groupFontPx } }}
              >
                {getSingleInitial(fallbackName)}
              </Avatar.Fallback>
            </Avatar>
          );
        })
      ) : (
        <AvatarPrimitive
          name={conversation?.groupName?.trim() || 'Nhom chat'}
          size={size}
        />
      )}
    </View>
  );
}

export function ChatAvatar(props: ChatAvatarProps) {
  return <DirectChatAvatar {...props} />;
}
