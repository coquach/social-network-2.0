'use client';

import { Button } from '@/components/ui/button';
import {
  useAcceptFriendRequest,
  useFriendRequests,
  useRejectFriendRequest,
} from '@repo/shared';
import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { FriendCard } from '../_components/friend-card';
import { Loader } from '@/components/loader-componnet';
import { Check, X } from 'lucide-react';

export const FriendRequests = () => {
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
  } = useFriendRequests({ limit: 12 });

  const { mutateAsync: acceptRequest } = useAcceptFriendRequest();
  const { mutateAsync: rejectRequest } = useRejectFriendRequest();

  const handleAccept = async (id: string) => {
    await acceptRequest(id);
  };

  const handleReject = async (id: string) => {
    await rejectRequest(id);
  };

  const friendRequests = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
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
        <span>Không thể tải lời mời kết bạn được</span>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {friendRequests.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
            Hiện không có lời mời kết bạn nào.
          </div>
        ) : (
          friendRequests.map((item) => {
            return (
              <FriendCard
                key={item}
                userId={item}
                action={
                  <div className="grid w-full grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => handleAccept(item)}
                    >
                      <Check className="h-4 w-4" />
                      Chấp nhận
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => handleReject(item)}
                    >
                      <X className="h-4 w-4" />
                      Từ chối
                    </Button>
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
