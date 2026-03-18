'use client';

import { Loader } from '@/components/loader-componnet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useGetUser } from '@/hooks/use-user-hook';
import {
  useDismissFriendRecommendation,
  useFriendSuggestions,
  useSendFriendRequest,
} from '@repo/shared';
import { UserPlus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';
import { FriendCard } from '../_components/friend-card';

type MutualFriendSnapshot = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
};

const MutualFriendAvatar = ({
  userId,
  user,
}: {
  userId: string;
  user?: MutualFriendSnapshot;
}) => {
  const { data: fetchedUser } = useGetUser(userId, {
    enabled: !user,
  });
  const resolvedUser = user ?? fetchedUser;
  const initials = `${resolvedUser?.firstName?.[0] ?? ''}${resolvedUser?.lastName?.[0] ?? ''}`.trim();

  return (
    <Avatar className="h-6 w-6 border-2 border-white">
      <AvatarImage
        src={resolvedUser?.avatarUrl || '/images/placeholder.png'}
        alt={initials || 'avatar'}
      />
      <AvatarFallback className="text-[10px] text-slate-600">
        {initials || '?'}
      </AvatarFallback>
    </Avatar>
  );
};

export const FriendSuggestions = () => {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const { ref, inView } = useInView({
    threshold: 0.3,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
  } = useFriendSuggestions({ limit: 12 });

  const { mutateAsync: requestFriend } = useSendFriendRequest();
  const { mutateAsync: dismissRecommendation } = useDismissFriendRecommendation();

  const handleRequest = async (id: string) => {
    await requestFriend(id);
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleSkip = async (id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    try {
      await dismissRecommendation(id);
    } catch (error) {
      setHiddenIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to dismiss this recommendation.',
      );
    }
  };

  const friendSuggestions = useMemo(
    () =>
      data?.pages
        .flatMap((page) => page.data)
        .filter((item) => !hiddenIds.has(item.id)) ?? [],
    [data, hiddenIds],
  );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isPending) {
    return (
      <div className="flex justify-center py-10">
        <Loader size={32} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-red-600 shadow-sm">
        <span>Không thể tải đề xuất kết bạn được.</span>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {friendSuggestions.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
            Hiện không có đề xuất nào.
          </div>
        ) : (
          friendSuggestions.map((item) => {
            const mutualFriendIds = item.mutualFriendIds ?? [];
            const mutualCount = item.mutualFriends ?? mutualFriendIds.length;
            const mutualPreview = item.mutualFriendPreview ?? [];
            const commonGroups = item.commonGroups ?? 0;
            const reasons = item.reasons?.filter(Boolean) ?? [];

            return (
              <FriendCard
                key={item.id}
                userId={item.id}
                user={item.user ?? undefined}
                action={
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {mutualPreview.length > 0 && (
                        <div className="flex -space-x-2">
                          {mutualPreview.map((friend, index) => (
                            <MutualFriendAvatar
                              key={`${friend.id}-${index}`}
                              userId={friend.id}
                              user={friend}
                            />
                          ))}
                        </div>
                      )}
                      <span>Bạn chung: {mutualCount}</span>
                    </div>
                    {(commonGroups > 0 || reasons.length > 0) && (
                      <div className="space-y-1 text-xs text-slate-500">
                        {commonGroups > 0 && <p>Nhóm chung: {commonGroups}</p>}
                        {reasons.length > 0 && (
                          <p className="line-clamp-2">{reasons.join(' | ')}</p>
                        )}
                      </div>
                    )}
                    <div className="grid w-full grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => handleRequest(item.id)}
                      >
                        <UserPlus className="h-4 w-4" />
                        Kết bạn
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => void handleSkip(item.id)}
                      >
                        <X className="h-4 w-4" />
                        Bỏ qua
                      </Button>
                    </div>
                  </div>
                }
              />
            );
          })
        )}
      </div>

      {hasNextPage && (
        <div ref={ref} className="flex h-10 items-center justify-center">
          {isFetchingNextPage && (
            <p className="animate-pulse text-sm text-gray-400">
              Đang tải thêm...
            </p>
          )}
        </div>
      )}
    </div>
  );
};
