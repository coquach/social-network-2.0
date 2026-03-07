'use client';

import { useGetUser } from '@/hooks/use-user-hook';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';

export const ProfileContentGuard = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { userId } = useParams<{ userId: string }>();
  const { data: fetchedUser, isLoading } = useGetUser(userId as string);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500 shadow-sm">
        Đang tải nội dung...
      </div>
    );
  }

  if (fetchedUser?.relation?.status === 'BLOCKED') {
    return (
      <div className="rounded-xl text-center border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-700 shadow-sm">
        Bạn đã chặn người này nên không xem được thông tin.
      </div>
    );
  }

  return <>{children}</>;
};
