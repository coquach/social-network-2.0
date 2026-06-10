'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, UserDTO } from '@repo/shared';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

type FriendCardUser = Partial<UserDTO> & {
  id: string;
  firstName: string;
  lastName: string;
};

interface FriendCardProps {
  userId: string;
  user?: FriendCardUser | null;
  action?: React.ReactNode;
}

export const FriendCard = ({ userId, user, action }: FriendCardProps) => {
  const {
    data: fetchedUser,
    isPending,
    isError,
    error,
    refetch,
  } = useUser(userId, {
    enabled: !user,
  });
  const router = useRouter();
  const resolvedUser = user ?? fetchedUser;

  const goToProfile = useCallback(() => {
    router.push(`/profile/${userId}`);
  }, [router, userId]);

  if (!resolvedUser && isPending) {
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

  if (!resolvedUser && isError) {
    console.error('FriendCard error:', error);
    return (
      <div className="flex flex-col items-center justify-center space-y-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-red-600 shadow-sm">
        <span>Unable to load user information.</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          className="border-red-200 text-red-600 hover:bg-red-100"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!resolvedUser) return null;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div
        className="relative h-24 w-full cursor-pointer overflow-hidden bg-slate-100"
        onClick={goToProfile}
      >
        <Image
          src={
            resolvedUser.coverImage?.url ||
            resolvedUser.coverImageUrl ||
            '/images/placeholder-bg.png'
          }
          alt={`${resolvedUser.firstName} ${resolvedUser.lastName}`}
          fill
          loading="lazy"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 via-slate-900/10 to-transparent" />
      </div>

      <div className="relative flex flex-1 flex-col gap-3 px-4 pb-4">
        <div className="flex items-end justify-between gap-3">
          <div
            className="relative -mt-8 h-16 w-16 cursor-pointer overflow-hidden rounded-full bg-slate-200 ring-4 ring-white"
            onClick={goToProfile}
          >
            <Image
              src={resolvedUser.avatarUrl || '/images/placeholder.png'}
              alt={`${resolvedUser.firstName} ${resolvedUser.lastName}`}
              fill
              loading="lazy"
              className="object-cover"
            />
          </div>
          {!action && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2 h-8 px-3 text-xs"
              onClick={goToProfile}
            >
              View profile
            </Button>
          )}
        </div>

        <p
          className="cursor-pointer text-base leading-tight font-semibold text-slate-900"
          onClick={goToProfile}
        >
          {resolvedUser.firstName} {resolvedUser.lastName}
        </p>

        <div className="mt-auto w-full">{action}</div>
      </div>
    </div>
  );
};
