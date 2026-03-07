'use client';

import { Button } from '@/components/ui/button';
import { useBlockedUsers, useUnblockUser } from '@repo/shared';
import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { FriendCard } from '../_components/friend-card';
import { Loader } from '@/components/loader-componnet';
import { ShieldOff } from 'lucide-react';

export const BlockedUsers = () => {
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
  } = useBlockedUsers({ limit: 12 });

  const { mutateAsync: unblockUser, isPending: isUnblocking } = useUnblockUser();

  const handleUnblock = async (id: string) => {
    await unblockUser(id);
  };

  const blockedUsers = useMemo(
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
        <span>Không thể tải danh sách người bị chặn được</span>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {blockedUsers.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
            Hiện không có người bị chặn.
          </div>
        ) : (
          blockedUsers.map((item) => {
            return (
              <FriendCard
                key={item}
                userId={item}
                action={
                  <div className="grid w-full grid-cols-1 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => handleUnblock(item)}
                      disabled={isUnblocking}
                    >
                      <ShieldOff className="h-4 w-4" />
                      Bỏ chặn
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
