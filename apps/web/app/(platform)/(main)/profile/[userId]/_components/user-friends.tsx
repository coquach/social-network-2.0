'use client';

import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { useParams } from 'next/navigation';
import { FriendCard } from '@/app/(platform)/(main)/friends/_components/friend-card';
import { Loader } from '@/components/loader-componnet';
import { useUserFriends } from '@repo/shared';

export const UserFriends = () => {
  const { userId } = useParams<{ userId: string }>() as { userId: string };
  const { ref, inView } = useInView({
    threshold: 0.3,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
    isPending,
  } = useUserFriends(userId, { limit: 12 });

  const friends = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
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
        <span>Không thể tải danh sách bạn bè được</span>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {friends.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
            Hiện chưa có bạn bè.
          </div>
        ) : (
          friends.map((item) => {
            return <FriendCard key={item.id} userId={item.id} />;
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
