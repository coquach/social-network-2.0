'use client';

import { useUser, PrivacyLevel, RelationStatus } from '@repo/shared';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

export const ProfileContentGuard = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { userId } = useParams<{ userId: string }>();
  const { userId: currentUserId } = useAuth();
  const { data: fetchedUser, isLoading } = useUser(userId as string);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500 shadow-sm animate-pulse">
        Đang tải nội dung...
      </div>
    );
  }

  if (fetchedUser?.relation?.status === 'BLOCKED') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-amber-700 shadow-sm mt-4">
        Bạn đã chặn người này nên không xem được thông tin.
      </div>
    );
  }

  const isOwner = currentUserId === userId;
  const isPrivate = fetchedUser?.privacySettings?.profileVisibility === PrivacyLevel.PRIVATE;
  const isFriend = fetchedUser?.relation?.status === RelationStatus.FRIEND;
  const isLocked = !isOwner && isPrivate && !isFriend;

  if (isLocked) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 py-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Lock className="h-8 w-8 text-slate-500" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-slate-800">Hồ sơ riêng tư</h3>
        <p className="mx-auto max-w-[280px] text-sm text-slate-500">
          Người dùng này đã khoá bảo vệ trang cá nhân. Hãy kết bạn để xem toàn bộ bài viết và thông tin chi tiết.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
