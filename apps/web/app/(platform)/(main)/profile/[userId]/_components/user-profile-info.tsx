'use client';

import { ErrorFallback } from '@/components/error-fallback';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetUser } from '@/hooks/use-user-hook';
import { useProfileModal } from '@/store/use-profile-modal';
import { format as formatDate } from 'date-fns';
import {
  CalendarDays,
  Check,
  MessageCircle,
  PenBox,
  ShieldAlert,
  ShieldX,
  UserPlus,
  UserX,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useMemo } from 'react';
import { CldImage } from 'next-cloudinary';
import {
  useAcceptFriendRequest,
  useBlockUser,
  useCancelFriendRequest,
  useRejectFriendRequest,
  useRemoveFriend,
  useSendFriendRequest,
  useUnblockUser,
} from '@repo/shared';
import { useStartConversation } from '@/hooks/use-start-conversation';
import { useImageViewerModal } from '@/store/use-image-viewer-modal';
import { useParams } from 'next/navigation';

export const UserProfileInfo = () => {
  const { userId } = useParams();
  const {
    data: fetchedUser,
    isLoading,
    isError,
    error,
  } = useGetUser(userId as string);

  const { mutate: requestFriend, isPending: isRequesting } = useSendFriendRequest();
  const { mutate: acceptFriendRequest, isPending: isAccepting } =
    useAcceptFriendRequest();
  const { mutate: declineFriendRequest, isPending: isDeclining } =
    useRejectFriendRequest();
  const { mutate: cancelFriendRequest, isPending: isCanceling } =
    useCancelFriendRequest();
  const { mutate: removeFriend, isPending: isRemoving } = useRemoveFriend();
  const { mutate: blockUser, isPending: isBlocking } = useBlockUser();
  const { mutate: unblockUser, isPending: isUnblocking } = useUnblockUser();
  const { startConversation, isPending: isStartingConversation } =
    useStartConversation();
  const { onOpen: openImageViewer } = useImageViewerModal();

  const profileModal = useProfileModal();

  const formattedCreatedAt = useMemo(() => {
    if (!fetchedUser?.createdAt) return null;
    return formatDate(new Date(fetchedUser.createdAt), 'dd/MM/yyyy');
  }, [fetchedUser?.createdAt]);

  const isBusy =
    isRequesting ||
    isAccepting ||
    isDeclining ||
    isCanceling ||
    isRemoving ||
    isBlocking ||
    isUnblocking ||
    isStartingConversation;

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="relative">
          <Skeleton className="h-70 w-full" />
          <div className="px-6 pb-6 md:px-8">
            <div className="-mt-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex items-end gap-4">
                <Skeleton className="h-24 w-24 rounded-full border-4 border-white shadow-md" />
                <div className="space-y-2 pb-1">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
            <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorFallback message={error.message} />;
  }

  if (!fetchedUser) return null;

  const relationStatus = fetchedUser.relation?.status;
  const coverUrl = fetchedUser.coverImage?.url ?? fetchedUser.coverImageUrl;
  const isSelf = relationStatus === 'SELF';
  const isBlocked = relationStatus === 'BLOCKED';
  const avatarSrc = fetchedUser.avatarUrl || '/images/placeholder.png';

  return (
    <div className="w-full">
      <div className="relative">
        <div className="relative h-70 w-full border-b border-slate-200 bg-slate-200">
          {coverUrl ? (
            <CldImage
              src={coverUrl}
              alt="Cover Image"
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-r from-slate-200 via-slate-100 to-slate-200" />
          )}
          {coverUrl && (
            <button
              type="button"
              onClick={() => openImageViewer(coverUrl, 'Ảnh bìa')}
              className="absolute inset-0 cursor-zoom-in"
              aria-label="Xem ảnh bìa"
            />
          )}
        </div>

        <div className="relative px-6 pb-6 md:px-8">
          <div className="-mt-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              <button
                type="button"
                onClick={() => openImageViewer(avatarSrc, 'Ảnh đại diện')}
                className="relative h-26 w-26 overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-md ring-1 ring-black/5 cursor-zoom-in"
                aria-label="Xem ảnh đại diện"
              >
                <Image
                  src={avatarSrc}
                  alt="Avatar"
                  fill
                  loading="lazy"
                  className="object-cover"
                />
              </button>

              <div className="space-y-1 pb-1">
                <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                  {fetchedUser.firstName} {fetchedUser.lastName}
                </h1>
                {formattedCreatedAt && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    {'Tham gia vào ' + formattedCreatedAt}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isSelf ? (
                <Button
                  size="sm"
                  onClick={() => profileModal.onOpen(userId as string)}
                >
                  <PenBox className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Button>
              ) : (
                <>
                  {!isBlocked && (
                    <Button
                      size="sm"
                      onClick={() => startConversation(userId as string)}
                      disabled={isBusy}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Nhắn tin
                    </Button>
                  )}

                  {relationStatus === 'NONE' && (
                    <Button
                      size="sm"
                      className="bg-sky-500 text-white shadow-sm transition hover:bg-sky-600"
                      onClick={() => requestFriend(userId as string)}
                      disabled={isBusy}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Kết bạn
                    </Button>
                  )}

                  {relationStatus === 'REQUESTED_OUT' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-300 text-slate-700 shadow-sm transition hover:bg-slate-50"
                      onClick={() => cancelFriendRequest(userId as string)}
                      disabled={isBusy}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Hủy lời mời
                    </Button>
                  )}

                  {relationStatus === 'REQUESTED_IN' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700"
                        onClick={() => acceptFriendRequest(userId as string)}
                        disabled={isBusy}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Chấp nhận
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full border-slate-300 text-slate-700 shadow-sm transition hover:bg-slate-50"
                        onClick={() => declineFriendRequest(userId as string)}
                        disabled={isBusy}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Từ chối
                      </Button>
                    </>
                  )}

                  {relationStatus === 'FRIEND' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFriend(userId as string)}
                      disabled={isBusy}
                    >
                      <UserX className="mr-1 h-4 w-4" />
                      Hủy kết bạn
                    </Button>
                  )}

                  {relationStatus !== 'SELF' && (
                    <Button
                      size="sm"
                      variant={isBlocked ? 'secondary' : 'outline'}
                      className={
                        isBlocked
                          ? ' bg-amber-100 text-amber-800 shadow-sm hover:bg-amber-200'
                          : ' text-slate-700 shadow-sm transition hover:bg-slate-50'
                      }
                      onClick={() =>
                        isBlocked
                          ? unblockUser(userId as string)
                          : blockUser(userId as string)
                      }
                      disabled={isBusy}
                    >
                      {isBlocked ? (
                        <ShieldX className="mr-2 h-4 w-4" />
                      ) : (
                        <ShieldAlert className="mr-1 h-4 w-4" />
                      )}
                      {isBlocked ? 'Bỏ chặn' : 'Chặn'}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-4 px-4 py-3">
            <p className="text-sm leading-relaxed text-slate-600">
              {fetchedUser.bio || 'Chưa có tiểu sử.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
