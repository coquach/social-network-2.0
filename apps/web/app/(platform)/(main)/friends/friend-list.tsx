'use client';

import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { useFriends, useRemoveFriend } from '@repo/shared';
import { useStartConversation } from '@/hooks/use-start-conversation';
import { Button } from '@/components/ui/button';
import { FriendCard } from './_components/friend-card';
import { Loader } from '@/components/loader-componnet';
import { MessageCircle, UserX } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const FriendList = () => {
  const { ref, inView } = useInView({
    threshold: 0.3, // chỉ cần cuộn gần cuối là fetch
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
    isPending,
  } = useFriends(undefined, { limit: 12 });

  const { mutateAsync: removeFriend, isPending: isRemovingFriend } =
    useRemoveFriend();
  const { startConversation, isPending: isCreatingConversation } =
    useStartConversation();

  const handleRemoveFriend = async (id: string) => {
    await removeFriend(id);
  };

  const handleMessage = (id: string) => {
    startConversation(id);
  };

  const friends = useMemo(
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
            Hiện không có bạn bè nào.
          </div>
        ) : (
          friends.map((item) => {
            return (
              <FriendCard
                key={item}
                userId={item}
                action={
                  <div className="grid w-full grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => handleMessage(item)}
                      disabled={isCreatingConversation}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Nhắn tin
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1 gap-2"
                          disabled={isRemovingFriend}
                        >
                          <UserX className="h-4 w-4" />
                          Xóa
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-rose-600">
                            Xóa bạn bè?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc muốn xóa người này khỏi danh sách bạn bè?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isRemovingFriend}>
                            Hủy
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleRemoveFriend(item)}
                            disabled={isRemovingFriend}
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
