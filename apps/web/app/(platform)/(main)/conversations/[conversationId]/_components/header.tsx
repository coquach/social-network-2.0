'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Ellipsis, Search } from 'lucide-react';
import { MdCall } from 'react-icons/md';
import { IoMdVideocam } from 'react-icons/io';
import { useAuth } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import { vi as viVN } from 'date-fns/locale';

import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { ProfileDrawer } from './drawer/profile-drawer';

import { usePresenceStore } from '@repo/shared';
import { useGetUser } from '@/hooks/use-user-hook';
import { GroupAvatar } from '../../_components/group-avatar';
import { DirectAvatar } from '../../_components/direct-avatar';

export const Header = ({ conversation }: { conversation: ConversationDTO }) => {
  const { userId: currentUserId } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  /** ----------- OTHER USER (1–1) ----------- */
  const otherUserId = useMemo(() => {
    if (conversation.isGroup) return undefined;
    const others = conversation.participants.filter(
      (participant) => participant !== currentUserId
    );
    return others[0];
  }, [conversation.isGroup, conversation.participants, currentUserId]);

  const { data: otherUser } = useGetUser(otherUserId ?? '');

  /** ----------- PRESENCE (1–1) ----------- */
  const presence = usePresenceStore((state) =>
    otherUserId ? state.getById(otherUserId) : undefined
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

        <div className="flex items-center gap-4 text-sky-500 cursor-pointer  transition">
          <MdCall size={24} className="hover:text-sky-600" />
          <IoMdVideocam size={24} className="hover:text-sky-600" />
          <Search size={24} className="hover:text-sky-600" />
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
