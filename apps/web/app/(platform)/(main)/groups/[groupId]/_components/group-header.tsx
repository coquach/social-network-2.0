'use client';

import { CalendarDays, Globe, Lock } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { HiMiniUserGroup } from 'react-icons/hi2';
import { IoMdSettings } from 'react-icons/io';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useGroupPermissionContext } from '@/contexts/group-permission-context';
import { useImageViewerModal } from '@/store/use-image-viewer-modal';
import { GroupPermission } from '@/models/group/enums/group-permission.enum';
import { GroupRole } from '@/models/group/enums/group-role.enum';
import { format as formatDate } from 'date-fns';
import { MembershipStatus } from '@/models/group/groupDTO';

// shadcn ui
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// import các api group (chỉnh path cho đúng với file của bạn)
import {
  useDeleteGroup,
  useLeaveGroup,
  useRequestToJoinGroup,
} from '@repo/shared';
import { FaKey } from 'react-icons/fa';
import { LuSettings2 } from 'react-icons/lu';
import { MdDeleteForever } from 'react-icons/md';
import { RiLogoutBoxLine } from 'react-icons/ri';
import { TbMessageReportFilled } from 'react-icons/tb';
import { GroupInviteDialog } from './invite-friend-modal';
import { ManageGroupDialog } from './manage-group-modal';
import { GroupReportDialog } from './report-modal';

export const GroupHeader = () => {
  const { group, role, can } = useGroupPermissionContext();
  const router = useRouter();
  const { onOpen: openImageViewer } = useImageViewerModal();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const coverImageUrl = group?.coverImageUrl;

  const formattedCreatedAt = useMemo(() => {
    if (!group?.createdAt) return null;
    return formatDate(new Date(group.createdAt), 'dd/MM/yyyy');
  }, [group?.createdAt]);

  const groupId = group?.id ?? '';
  const { mutateAsync: joinGroup, isPending: isJoining } =
    useRequestToJoinGroup(groupId);
  const { mutateAsync: leaveGroupMutate, isPending: isLeaving } =
    useLeaveGroup(groupId);
  const { mutateAsync: deleteGroupMutate, isPending: isDeleting } =
    useDeleteGroup(groupId);

  if (!group) return null;

  const isPublic = group.privacy === 'PUBLIC';
  const isPrivate = group.privacy === 'PRIVATE';

  const membershipStatus =
    group.membershipStatus ??
    (role ? MembershipStatus.MEMBER : MembershipStatus.NONE);
  const isMember = membershipStatus === MembershipStatus.MEMBER || !!role;
  const canInviteFriends =
    (group.groupSetting?.allowMemberInvite ?? false) ||
    can(GroupPermission.INVITE_MEMBERS);
  const isOwner = role === GroupRole.OWNER;

  const handleJoinGroup = async () => {
    const promise = joinGroup();
    toast.promise(promise, {
      loading: 'Đang gửi yêu cầu tham gia nhóm...',
    });
    try {
      await promise;
      router.refresh();
    } catch {}
  };

  const handleLeaveGroup = async () => {
    const promise = leaveGroupMutate();
    toast.promise(promise, {
      loading: 'Đang rời nhóm...',
    });
    try {
      await promise;
      router.refresh();
    } catch {}
  };

  const handleDeleteGroup = async () => {
    const promise = deleteGroupMutate();
    toast.promise(promise, {
      loading: 'Đang xóa nhóm...',
    });
    try {
      await promise;
      setDeleteOpen(false);
      router.replace('/groups');
    } catch {}
  };

  return (
    <div className="w-full">
      <div className="relative">
        {/* Cover */}
        <div className="relative h-70 w-full border-b border-slate-200 bg-slate-200">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt="Cover Image"
              fill
              loading="lazy"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-r from-slate-200 via-slate-100 to-slate-200" />
          )}
          {coverImageUrl && (
            <button
              type="button"
              onClick={() => openImageViewer(coverImageUrl, 'Ảnh bìa')}
              className="absolute inset-0 cursor-zoom-in"
              aria-label="Xem ảnh bìa"
            />
          )}
        </div>

        {/* Content */}
        <div className="relative px-6 pb-6 md:px-8">
          <div className="mt-3 sm:-mt-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              <button
                type="button"
                onClick={() =>
                  openImageViewer(
                    group.avatarUrl || '/images/placeholder.png',
                    'Ảnh đại diện'
                  )
                }
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-md ring-1 ring-black/5 cursor-zoom-in sm:h-26 sm:w-26"
                aria-label="Xem ảnh đại diện"
              >
                <Image
                  src={group.avatarUrl || '/images/placeholder.png'}
                  alt="Avatar"
                  fill
                  loading="lazy"
                  className="object-cover"
                />
              </button>

              <div className="space-y-1 pb-1 pt-2 sm:pt-0">
                <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                  {group.name}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    {isPublic && <Globe className="h-4 w-4" />}
                    {isPrivate && <Lock className="h-4 w-4" />}
                    {isPublic
                      ? 'Công khai'
                      : isPrivate
                      ? 'Riêng tư'
                      : 'Không rõ'}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <HiMiniUserGroup className="h-4 w-4" />
                    {group.members ?? 0} thành viên
                  </span>

                  {formattedCreatedAt && (
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" />
                      Lập vào {formattedCreatedAt}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Mời bạn bè: chỉ cho member trở lên */}
              {isMember && canInviteFriends && <GroupInviteDialog />}

              {/* Join / Joined */}
              {membershipStatus === MembershipStatus.NONE ? (
                <Button onClick={handleJoinGroup} disabled={isJoining}>
                  {isJoining ? 'Đang gửi yêu cầu...' : 'Tham gia nhóm'}
                </Button>
              ) : membershipStatus === MembershipStatus.INVITED ? (
                <Button variant="outline" disabled className="cursor-default">
                  Đã được mời
                </Button>
              ) : membershipStatus === MembershipStatus.PENDING_APPROVAL ? (
                <Button variant="outline" disabled className="cursor-default">
                  Đang chờ duyệt
                </Button>
              ) : membershipStatus === MembershipStatus.BANNED ? (
                <Button variant="outline" disabled className="cursor-default">
                  Đã bị cấm
                </Button>
              ) : isOwner ? (
                <Button variant="outline" disabled className="cursor-default">
                  <FaKey />
                  Chủ nhóm
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <HiMiniUserGroup className="mr-1.5 h-4 w-4" />
                      Đã tham gia
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={handleLeaveGroup}
                      disabled={isLeaving} // tùy rule: owner có được rời nhóm không?
                    >
                      <RiLogoutBoxLine className="text-red-600" />
                      {isLeaving ? 'Đang rời nhóm...' : 'Rời nhóm'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Settings dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon">
                    <IoMdSettings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="cursor-pointer">
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => setReportOpen(true)}
                  >
                    <TbMessageReportFilled className="text-rose-600" />
                    Báo cáo nhóm
                  </DropdownMenuItem>
                  {can(GroupPermission.VIEW_SETTINGS) && (
                    <DropdownMenuItem onClick={() => setManageOpen(true)}>
                      <LuSettings2 />
                      Quản lý cài đặt nhóm
                    </DropdownMenuItem>
                  )}
                  {isOwner && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setDeleteOpen(true)}
                      >
                        <MdDeleteForever className="text-red-600" />
                        Xóa nhóm
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-4 px-4 py-3">
            <p className="text-sm leading-relaxed text-slate-600">
              {group.description || 'Chưa có mô tả'}
            </p>
          </div>
        </div>
      </div>

      {/* AlertDialog xác nhận xóa nhóm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa nhóm?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Tất cả bài viết, thành viên và
              dữ liệu liên quan đến nhóm <b>{group.name}</b> sẽ bị xóa vĩnh
              viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa nhóm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ManageGroupDialog open={manageOpen} onOpenChange={setManageOpen} />
      <GroupReportDialog open={reportOpen} onOpenChange={setReportOpen} />
    </div>
  );
};
