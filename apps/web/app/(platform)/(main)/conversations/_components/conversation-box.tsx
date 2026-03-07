'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useGetUser } from '@/hooks/use-user-hook';
import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { ensureLastSeenMap } from '@/utils/ensure-last-seen-map';
import { useAuth } from '@clerk/nextjs';
import clsx from 'clsx';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { DirectAvatar } from './direct-avatar';
import { GroupAvatar } from './group-avatar';

interface ConversationBoxProps {
  data: ConversationDTO;
  selected?: boolean;
}

export const ConversationBox = ({ data, selected }: ConversationBoxProps) => {
  const { userId: currentUserId } = useAuth();
  const router = useRouter();

  const lastMessage = data.lastMessage;
  const isGroup = data.isGroup;

  const isHiddenForMe = useMemo(() => {
    if (!currentUserId) return false;
    return (data.hiddenFor ?? []).includes(currentUserId);
  }, [data.hiddenFor, currentUserId]);

  /** ----------- OTHER USER (1–1) ----------- */
  const otherUserId = useMemo(() => {
    if (isGroup) return undefined;
    const other = data.participants.find((p) => p !== currentUserId);
    return other || undefined;
  }, [isGroup, data.participants, currentUserId]);

  const { data: otherUser } = useGetUser(otherUserId ?? '');

  /** ----------- SENDER INFO ----------- */
  const { data: senderUser } = useGetUser(lastMessage?.senderId ?? '');

  /** ----------- CLICK ----------- */
  const handleClick = useCallback(() => {
    router.push(`/conversations/${data._id}`);
  }, [router, data._id]);

  /** ----------- SEEN STATUS ----------- */
  const hasSeen = useMemo(() => {
    if (!currentUserId) return false;
    if (!lastMessage?._id) return true;
    if (lastMessage.senderId === currentUserId) return true;

    const map = ensureLastSeenMap(data.lastSeenMessageId);
    const lastSeenId = map.get(currentUserId);

    return lastSeenId === lastMessage._id;
  }, [currentUserId, lastMessage?._id, data.lastSeenMessageId]);

  /** ----------- LAST MESSAGE TEXT ----------- */
  const lastMessageText = useMemo(() => {
    if (!lastMessage) {
      return isGroup
        ? 'Tạo nhóm để bắt đầu trò chuyện'
        : 'Bắt đầu cuộc trò chuyện';
    }

    const isMe = lastMessage.senderId === currentUserId;
    const senderName = isMe
      ? 'Tôi'
      : senderUser
      ? `${senderUser.firstName ?? ''} ${senderUser.lastName ?? ''}`.trim() ||
        'Người khác'
      : 'Người khác';

    if (lastMessage.isDeleted) return `${senderName}: Đã xóa tin nhắn`;

    if (lastMessage.attachments?.length && !lastMessage.content) {
      return `${senderName}: Đã gửi tệp đính kèm`;
    }

    const raw = lastMessage.content ?? '';
    const truncated = raw.length > 80 ? `${raw.slice(0, 80)}…` : raw;

    return `${senderName}: ${truncated || 'Đã gửi tin nhắn'}`;
  }, [lastMessage, currentUserId, senderUser, isGroup]);

  /** ----------- TITLE & SUBTITLE ----------- */
  const title = useMemo(() => {
    if (isGroup) return data.groupName || 'Nhóm không tên';
    if (otherUser) {
      return (
        `${otherUser.firstName ?? ''} ${otherUser.lastName ?? ''}`.trim() ||
        'Cuộc trò chuyện'
      );
    }
    return 'Cuộc trò chuyện';
  }, [isGroup, otherUser, data.groupName]);

  const subtitle = useMemo(() => {
    if (isHiddenForMe) return 'Cuộc trò chuyện đang bị ẩn';

    return lastMessageText;
  }, [isHiddenForMe, lastMessageText]);

  return (
    <div
      onClick={handleClick}
      className={clsx(
        'w-full relative flex flex-col rounded-lg transition p-2 cursor-pointer',
        isHiddenForMe
          ? 'bg-neutral-50 opacity-70'
          : clsx(selected ? 'bg-gray-100' : 'bg-white hover:bg-gray-100')
      )}
    >
      {/* Top row: avatar + title + time */}
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-4 min-w-0">
          {/* Avatar */}
          {isGroup ? (
            <GroupAvatar conversation={data} />
          ) : (
            <DirectAvatar userId={otherUserId} />
          )}

          {/* Title + subtitle */}
          <div className="flex flex-col min-w-0">
            <span className="text-sm truncate font-semibold text-black">
              {title}
            </span>

            <span
              className={clsx(
                'text-xs truncate',
                isHiddenForMe
                  ? 'text-gray-500'
                  : hasSeen
                  ? 'text-gray-500'
                  : 'text-black font-medium'
              )}
            >
              {subtitle}
            </span>
          </div>
        </div>

        {/* Time */}
        {lastMessage?.createdAt && (
          <p className="ml-2 shrink-0 text-[11px] text-gray-500">
            {format(new Date(lastMessage.createdAt), 'HH:mm', { locale: vi })}
          </p>
        )}
      </div>

      {/* Extra line cho group để show last message riêng */}
      {/* {showExtraLastMessageLine && lastMessage && (
        <p
          className={clsx(
            'mt-1 ml-12 text-xs truncate',
            hasSeen ? 'text-gray-500' : 'text-gray-900 font-medium'
          )}
        >
          {lastMessageText}
        </p>
      )} */}
    </div>
  );
};

ConversationBox.Skeleton = function ConversationBoxSkeleton() {
  return (
    <div className="w-full relative flex flex-col rounded-lg p-2 bg-white">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-3 w-40 rounded" />
          </div>
        </div>
        <Skeleton className="h-3 w-16 rounded" />
      </div>

      <Skeleton className="h-3 w-40 mt-2 ml-12 rounded" />
    </div>
  );
};
