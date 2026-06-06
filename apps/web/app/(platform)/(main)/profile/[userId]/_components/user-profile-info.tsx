'use client';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ErrorFallback } from '@/components/error-fallback';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStartConversation } from '@/hooks/use-start-conversation';
import { useImageViewerModal } from '@/store/use-image-viewer-modal';
import { useProfileModal } from '@/store/use-profile-modal';
import {
  useAcceptFriendRequest,
  useBlockUser,
  useCancelFriendRequest,
  useRejectFriendRequest,
  useRemoveFriend,
  useSendFriendRequest,
  useUnblockUser,
  useUser,
} from '@repo/shared';
import { format as formatDate } from 'date-fns';
import {
  Briefcase,
  Building2,
  CalendarDays,
  Check,
  GraduationCap,
  MapPin,
  MessageCircle,
  PenBox,
  ShieldAlert,
  ShieldX,
  Tags,
  UserPlus,
  UserX,
  X,
} from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';

export const UserProfileInfo = () => {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const {
    data: fetchedUser,
    isLoading,
    isError,
    error,
  } = useUser(userId as string);

  const { mutate: requestFriend, isPending: isRequesting } =
    useSendFriendRequest();
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
  const interests = fetchedUser.interests?.filter(Boolean) ?? [];

  return (
    <div className="w-full">
      <div className="relative">
        <div className="relative h-70 w-full border-b border-slate-200 bg-slate-200">
          {coverUrl ? (
            <CldImage
              src={coverUrl}
              alt="Ảnh bìa"
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
                className="relative h-26 w-26 cursor-zoom-in overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-md ring-1 ring-black/5"
                aria-label="Xem ảnh đại diện"
              >
                <Image
                  src={avatarSrc}
                  alt="Ảnh đại diện"
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
                    {`Tham gia vào ${formattedCreatedAt}`}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isSelf ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => profileModal.onOpen(userId as string)}
                  >
                    <PenBox className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="outline" className="h-9 w-9">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem
                        onClick={() => router.push('/settings/activity')}
                      >
                        Nhật ký hoạt động
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          router.push('/settings/moderation-history')
                        }
                      >
                        Lịch sử kiểm duyệt
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
                          ? 'bg-amber-100 text-amber-800 shadow-sm hover:bg-amber-200'
                          : 'text-slate-700 shadow-sm transition hover:bg-slate-50'
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

            {(fetchedUser.location ||
              fetchedUser.jobTitle ||
              fetchedUser.company ||
              fetchedUser.school) && (
              <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                {fetchedUser.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                    <span>{fetchedUser.location}</span>
                  </div>
                )}
                {fetchedUser.jobTitle && (
                  <div className="flex items-start gap-2">
                    <Briefcase className="mt-0.5 h-4 w-4 text-slate-400" />
                    <span>{fetchedUser.jobTitle}</span>
                  </div>
                )}
                {fetchedUser.company && (
                  <div className="flex items-start gap-2">
                    <Building2 className="mt-0.5 h-4 w-4 text-slate-400" />
                    <span>{fetchedUser.company}</span>
                  </div>
                )}
                {fetchedUser.school && (
                  <div className="flex items-start gap-2">
                    <GraduationCap className="mt-0.5 h-4 w-4 text-slate-400" />
                    <span>{fetchedUser.school}</span>
                  </div>
                )}
              </div>
            )}

            {interests.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Tags className="h-4 w-4 text-slate-400" />
                  Quan tâm
                </div>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
