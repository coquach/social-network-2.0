'use client';

import { Loader } from '@/components/loader-componnet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useGetUser } from '@/hooks/use-user-hook';
import { useFriendSuggestions, useSendFriendRequest } from '@repo/shared';
import { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { FriendCard } from '../_components/friend-card';
import { UserPlus, X } from 'lucide-react';

const MutualFriendAvatar = ({ userId }: { userId: string }) => {
  const { data: user } = useGetUser(userId);
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.trim();

  return (
    <Avatar className="h-6 w-6 border-2 border-white">
      <AvatarImage
        src={user?.avatarUrl || '/images/placeholder.png'}
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
    threshold: 0.3, // chỉ cần cuộn gần cuối là fetch
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

  const handleRequest = async (id: string) => {
    await requestFriend(id);
  };

  const handleSkip = (id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const friendSuggestions = useMemo(
    () =>
      data?.pages
        .flatMap((page) => page.data)
        .filter((item) => !hiddenIds.has(item.id)) ?? [],
    [data, hiddenIds]
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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-red-600 shadow-sm space-y-2">
        <span>Không thể tải đề xuất kết bạn được</span>
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
            const mutualPreview = mutualFriendIds.slice(0, 3);
            return (
              <FriendCard
                key={item.id}
                userId={item.id}
                action={
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {mutualPreview.length > 0 && (
                        <div className="flex -space-x-2">
                          {mutualPreview.map((friendId, index) => (
                            <MutualFriendAvatar
                              key={`${friendId}-${index}`}
                              userId={friendId}
                            />
                          ))}
                        </div>
                      )}
                      <span>Bạn chung: {mutualCount}</span>
                    </div>
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
                        onClick={() => handleSkip(item.id)}
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
        <div ref={ref} className="h-10 flex justify-center items-center">
          {isFetchingNextPage && (
            <p className="text-sm text-gray-400 animate-pulse">
              Đang tải thêm...
            </p>
          )}
        </div>
      )}
    </div>
  );
};
