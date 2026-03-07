'use client';

import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';
import { useGetUser } from '@/hooks/use-user-hook';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DirectAvatar } from '../../../_components/direct-avatar';

export const DirectHeader = ({
  conversation,
}: {
  conversation: ConversationDTO;
}) => {
  const { userId: currentUserId } = useAuth();

  const otherUserId = useMemo(() => {
    return conversation.participants.find((p) => p !== currentUserId);
  }, [conversation.participants, currentUserId]);

  const { data: otherUser, isLoading } = useGetUser(otherUserId ?? '');

  const title = useMemo(() => {
    if (isLoading) return 'Đang tải...';
    if (!otherUser) return 'Người dùng';
    return (
      `${otherUser.firstName ?? ''} ${otherUser.lastName ?? ''}`.trim() ||
      'Người dùng'
    );
  }, [otherUser, isLoading]);

  const joinedAt = useMemo(() => {
    if (!otherUser?.createdAt) return null;
    return format(new Date(otherUser.createdAt), 'dd-MM-yyyy', { locale: vi });
  }, [otherUser?.createdAt]);

  const convCreatedAt = useMemo(() => {
    if (!conversation.createdAt) return null;
    return format(new Date(conversation.createdAt), 'dd-MM-yyyy', {
      locale: vi,
    });
  }, [conversation.createdAt]);

  return (
    <div className="flex flex-col items-center gap-3">
      <DirectAvatar userId={otherUserId} className="h-16 w-16" />

      <div className="text-center">
        <p className="text-lg font-semibold text-neutral-900">{title}</p>
        {otherUser?.email && (
          <p className="text-xs text-gray-500 mt-0.5">{otherUser.email}</p>
        )}
      </div>

      {otherUserId && (
        <div className="flex gap-2">
          <Button asChild size="sm" className="bg-sky-500 hover:bg-sky-600">
            <Link href={`/profile/${otherUserId}`}>Xem trang cá nhân</Link>
          </Button>

     
        </div>
      )}

      {/* Meta */}
      <div className="w-full mt-2 grid grid-cols-1 gap-2">
        <div className="rounded-xl border border-gray-200 p-3">
          <div className="text-xs text-gray-500">Cuộc trò chuyện</div>
          <div className="text-sm text-gray-900">
            {convCreatedAt ?? 'Không xác định'}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-3">
          <div className="text-xs text-gray-500">Người dùng tham gia</div>
          <div className="text-sm text-gray-900">
            {joinedAt ?? 'Không xác định'}
          </div>
        </div>
      </div>
    </div>
  );
};
