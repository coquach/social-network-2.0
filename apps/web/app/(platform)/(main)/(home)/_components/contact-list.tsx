'use client';

import { AvatarWithStatus } from '@/components/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useActiveChannel } from '@/hooks/use-active-channel';
import { useFriends } from '@repo/shared';
import { useStartConversation } from '@/hooks/use-start-conversation';
import { ChevronRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

const CONTACT_LIMIT = 8;

export const ContactList = () => {
  const { data, isPending, isError } = useFriends(undefined, { limit: CONTACT_LIMIT });
  const { startConversation, isPending: isStartingConversation } =
    useStartConversation();

  const friends = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  useActiveChannel(friends);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-linear-to-r from-sky-50 via-white to-indigo-50 px-4 py-3">
        <p className="text-lg font-bold text-sky-500">Liên hệ</p>

        <div className="flex items-center gap-2">
          <Link
            href="/friends"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-sky-600"
          >
            Xem tất cả
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="px-2 py-2 max-h-[350px] overflow-y-auto overscroll-contain">
        {isPending &&
          Array.from({ length: CONTACT_LIMIT }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 px-2 py-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="mt-2 h-3 w-16" />
              </div>
            </div>
          ))}

        {!isPending && isError && (
          <div className="mx-2 my-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600">
            Không thể tải danh sách liên hệ.
          </div>
        )}

        {!isPending && !isError && friends.length === 0 && (
          <div className="mx-2 my-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
            Chưa có bạn bè nào để hiển thị.
          </div>
        )}

        {!isPending &&
          !isError &&
          friends.map((userId) => (
            <button
              key={userId}
              type="button"
              onClick={() => startConversation(userId)}
              disabled={isStartingConversation}
              className="cursor-pointer flex w-full items-center justify-between rounded-xl px-2 py-2 text-left transition hover:bg-neutral-50/10 disabled:opacity-60"
            >
              <AvatarWithStatus userId={userId} />
              <MessageCircle className="h-3.5 w-3.5 text-sky-200" />
            </button>
          ))}
      </div>
    </div>
  );
};
