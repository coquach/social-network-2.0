'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Ellipsis, Search } from 'lucide-react';
import { MdCall } from 'react-icons/md';
import { IoMdVideocam } from 'react-icons/io';
import { useAuth } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import { vi as viVN } from 'date-fns/locale';
import { useQueryClient } from '@tanstack/react-query';

import {
  ConversationDTO,
  useUser,
  usePresenceStore,
  CallType,
  queryKeys,
} from '@repo/shared';
import { ProfileDrawer } from './drawer/profile-drawer';
import { useCallActions } from '@/hooks/use-call-actions';
import { toast } from 'sonner';
import { useSocket } from '@/components/providers/socket-provider';

import { GroupAvatar } from '../../_components/group-avatar';
import { DirectAvatar } from '../../_components/direct-avatar';

export const Header = ({ conversation }: { conversation: ConversationDTO }) => {
  const { userId: currentUserId } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { chatSocket } = useSocket();
  const queryClient = useQueryClient();

  const { startCall, joinOngoingCall, endCall } = useCallActions();

  useEffect(() => {
    if (!chatSocket || !conversation._id) return;

    const onCallInvite = (payload: any) => {
      if (payload.conversationId === conversation._id) {
        queryClient.setQueryData(
          queryKeys.conversations.detail(conversation._id),
          (old: any) => old ? { ...old, activeCallId: payload.id || payload._id } : old
        );
      }
    };

    const onCallEnded = (payload: any) => {
      if (payload.conversationId === conversation._id) {
        queryClient.setQueryData(
          queryKeys.conversations.detail(conversation._id),
          (old: any) => old ? { ...old, activeCallId: undefined } : old
        );
      }
    };

    chatSocket.on('call.invite', onCallInvite);
    chatSocket.on('call.ended', onCallEnded);

    return () => {
      chatSocket.off('call.invite', onCallInvite);
      chatSocket.off('call.ended', onCallEnded);
    };
  }, [chatSocket, conversation._id, queryClient]);

  const handleStartCall = async (type: CallType) => {
    if (!conversation._id) return;
    const result = await startCall(conversation._id, type);
    if (!result.ok) {
      toast.error(result.message);
    }
  };

  const handleJoinCall = async () => {
    if (!conversation.activeCallId) return;
    await joinOngoingCall(conversation.activeCallId);
  };

  /** ----------- OTHER USER (1–1) ----------- */
  const otherUserId = useMemo(() => {
    if (conversation.isGroup) return undefined;
    const others = conversation.participants.filter(
      (participant) => participant !== currentUserId,
    );
    return others[0];
  }, [conversation.isGroup, conversation.participants, currentUserId]);

  const { data: otherUser } = useUser(otherUserId ?? '', {
    enabled: !!otherUserId,
  });

  /** ----------- PRESENCE (1–1) ----------- */
  const presence = usePresenceStore((state) =>
    otherUserId ? state.getById(otherUserId) : undefined,
  );

  /** ----------- TITLE ----------- */
  const title = useMemo(() => {
    if (conversation.isGroup) {
      return conversation.groupName || 'Nhóm không tên';
    }

    if (!otherUser) return 'Người dùng';

    const full = `${otherUser.firstName ?? ''} ${
      otherUser.lastName ?? ''
    }`.trim();

    return full || 'Người dùng';
  }, [conversation.isGroup, conversation.groupName, otherUser]);

  /** ----------- SUBTITLE ----------- */
  const subtitle = useMemo(() => {
    // Group: số thành viên
    if (conversation.isGroup) {
      return `${conversation.participants.length} thành viên`;
    }

    // Direct: online / offline + lastSeen
    if (!presence || presence.status === 'offline') {
      if (presence?.lastSeen) {
        const ts =
          typeof presence.lastSeen === 'string'
            ? Number(presence.lastSeen)
            : presence.lastSeen;
        const d = new Date(ts);
        if (!isNaN(d.getTime())) {
          return `Hoạt động ${formatDistanceToNow(d, {
            addSuffix: true,
            locale: viVN,
          })}`;
        }
      }
      return 'Ngoại tuyến';
    }

    if (presence.status === 'away') {
      return 'Đang tạm vắng';
    }

    // online
    return 'Đang hoạt động';
  }, [conversation.isGroup, conversation.participants.length, presence]);

  return (
    <>
      <ProfileDrawer
        conversation={conversation}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <div className="bg-white w-full flex border-b sm:px-4 py-3 px-4 lg:px-6 justify-between items-center shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/conversations"
            className="lg:hidden block text-sky-500 hover:text-sky-600 transition cursor-pointer"
          >
            <ChevronLeft size={32} />
          </Link>

          {conversation.isGroup ? (
            <div className="flex items-center gap-4 min-w-0">
              <GroupAvatar conversation={conversation} />
              <div className="flex flex-col min-w-0">
                <span className="text-lg font-semibold text-neutral-800 truncate">
                  {title}
                </span>
                <span className="text-sm font-medium text-neutral-500 truncate">
                  {subtitle /* số thành viên */}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <DirectAvatar userId={otherUserId} />
              <div className="flex flex-col min-w-0">
                <span className="text-lg font-semibold text-neutral-800 truncate">
                  {title}
                </span>
                <span className="text-sm font-medium text-neutral-500 truncate">
                  <span
                    className={`
      inline-block w-2.5 h-2.5 rounded-full mr-0.5
      ${
        presence?.status === 'online'
          ? 'bg-green-500'
          : presence?.status === 'away'
            ? 'bg-yellow-500'
            : 'bg-gray-400'
      }
    `}
                  />
                  {subtitle /* online / offline / last seen */}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-sky-500 cursor-pointer transition">
          <Search size={24} className="hover:text-sky-600" />
          
          {conversation.activeCallId ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleJoinCall}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-1.5 rounded-full flex items-center gap-1.5 transition duration-200 shadow-sm"
              >
                <IoMdVideocam size={16} />
                <span>Tham gia</span>
              </button>
              <button
                onClick={() => {
                  endCall(conversation.activeCallId, conversation.isGroup);
                }}
                className="bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm px-4 py-1.5 rounded-full flex items-center gap-1.5 transition duration-200 shadow-sm"
                title="Kết thúc phiên gọi hiện tại"
              >
                <MdCall size={16} />
                <span>Kết thúc</span>
              </button>
            </div>
          ) : (
            <>
              <MdCall
                size={24}
                className="hover:text-sky-600"
                onClick={() => handleStartCall(CallType.AUDIO)}
              />
              <IoMdVideocam
                size={24}
                className="hover:text-sky-600"
                onClick={() => handleStartCall(CallType.VIDEO)}
              />
            </>
          )}

          <Ellipsis
            size={32}
            onClick={() => {
              setDrawerOpen(true);
            }}
          />
        </div>
      </div>
    </>
  );
};
