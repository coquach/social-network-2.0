'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetUser } from '@/hooks/use-user-hook';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface FriendCardProps {
  userId: string;
  action?: React.ReactNode; // truyền nút hành động từ cha
}

export const FriendCard = ({ userId, action }: FriendCardProps) => {
  const { data: user, isPending, isError, error, refetch } = useGetUser(userId);
  const router = useRouter();

  const goToProfile = useCallback(() => {
    router.push(`/profile/${userId}`);
  }, [router, userId]);

  if (isPending) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
        <Skeleton className="h-24 w-full" />
        <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
          <div className="-mt-8">
            <Skeleton className="h-16 w-16 rounded-full ring-4 ring-white" />
          </div>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (isError) {
    console.error('FriendCard error:', error);
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-red-600 shadow-sm space-y-2">
        <span>Không thể tải thông tin người dùng được</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          className="text-red-600 border-red-200 hover:bg-red-100"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div
        className="relative h-24 w-full overflow-hidden bg-slate-100 cursor-pointer"
        onClick={goToProfile}
      >
        <Image
          src={
            user.coverImage?.url ||
            user.coverImageUrl ||
            '/images/placeholder-bg.png'
          }
          alt={`${user.firstName} ${user.lastName}`}
          fill
          loading="lazy"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 via-slate-900/10 to-transparent" />
      </div>

      <div className="relative flex flex-1 flex-col gap-3 px-4 pb-4">
        <div className="flex items-end justify-between gap-3">
          <div
            className="relative -mt-8 h-16 w-16 overflow-hidden rounded-full ring-4 ring-white bg-slate-200 cursor-pointer"
            onClick={goToProfile}
          >
            <Image
              src={user.avatarUrl || '/images/placeholder.png'}
              alt={`${user.firstName} ${user.lastName}`}
              fill
              loading="lazy"
              className="object-cover"
            />
          </div>
          {!action && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 mt-2 text-xs"
              onClick={goToProfile}
            >
              Xem hồ sơ
            </Button>
          )}
        </div>

        <p
          className="text-base font-semibold text-slate-900 leading-tight cursor-pointer"
          onClick={goToProfile}
        >
          {user.firstName} {user.lastName}
        </p>

        <div className="mt-auto w-full">{action}</div>
      </div>
    </div>
  );
};
