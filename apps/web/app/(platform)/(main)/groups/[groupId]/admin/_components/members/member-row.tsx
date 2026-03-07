'use client';

import { useState } from 'react';

import { GroupMemberStatus } from '@/models/group/enums/group-member-status.enum';
import { GroupPermission } from '@/models/group/enums/group-permission.enum';
import { GroupRole } from '@/models/group/enums/group-role.enum';
import { GroupMemberDTO } from '@/models/group/groupMemberDTO';

import { useGroupPermissionContext } from '@/contexts/group-permission-context';
import {
  useBanMember,
  useChangeMemberPermission,
  useChangeMemberRole,
  useRemoveMember,
  useUnbanMember,
} from '@repo/shared';
import { useGetUser } from '@/hooks/use-user-hook';
import { UserDTO } from '@/models/user/userDTO';

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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ChangeRoleForm } from './change-role-form';
import { ChangePermissionForm } from './change-permission-form';
import Image from 'next/image';

type AdminMemberRowProps = {
  member: GroupMemberDTO;
  groupId: string;
};

const roleLabel: Record<GroupRole, string> = {
  OWNER: 'Chủ nhóm',
  ADMIN: 'Quản trị viên',
  MODERATOR: 'Người kiểm duyệt',
  MEMBER: 'Thành viên',
};

export const GroupAdminMemberRow = ({
  member,
  groupId,
}: AdminMemberRowProps) => {
  const { role: currentRole, can } = useGroupPermissionContext();

  const { data: user, isLoading: userLoading } = useGetUser(member.userId);

  const [removeOpen, setRemoveOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [unbanOpen, setUnbanOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [editPermOpen, setEditPermOpen] = useState(false);

  const { mutate: removeMember, isPending: removing } =
    useRemoveMember(groupId);
  const { mutate: banMemberMutate, isPending: banning } = useBanMember(groupId);
  const { mutate: unbanMemberMutate, isPending: unbanning } =
    useUnbanMember(groupId);
  const { mutate: changeRoleMutate, isPending: changingRole } =
    useChangeMemberRole(groupId);
  const { mutate: changePermMutate, isPending: changingPerm } =
    useChangeMemberPermission(groupId);

  const isOwner = member.role === GroupRole.OWNER;

  const canManageMembers = can(GroupPermission.MANAGE_MEMBERS);
  const canBan = can(GroupPermission.BAN_MEMBER);
  const canEditPermission = can(GroupPermission.UPDATE_GROUP_SETTINGS);

  const canKickThis =
    canManageMembers && !isOwner && member.status === GroupMemberStatus.ACTIVE;
  const canBanThis =
    canBan && !isOwner && member.status === GroupMemberStatus.ACTIVE;
  const canUnbanThis = canBan && member.status === GroupMemberStatus.BANNED;
  const canChangeRoleThis = canManageMembers && !isOwner;
  const canChangePermThis = canEditPermission && !isOwner;

  const displayName = getDisplayName(user);

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border bg-white px-3 py-2 shadow-sm hover:shadow-md transition-shadow">
        {/* Left: avatar + info */}
        <div className="flex items-center gap-3 min-w-0">
          {userLoading ? (
            <Skeleton className="h-9 w-9 rounded-full" />
          ) : (
            <div className="relative h-9 w-9 rounded-full overflow-hidden bg-slate-100">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={displayName}
                  fill
                  loading="lazy"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate text-slate-900">
              {displayName || member.userName || 'Người dùng'}
            </div>
            <div className="text-xs flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-sky-600 font-semibold">
                {roleLabel[member.role]}
              </span>
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex flex-wrap items-center gap-1.5 justify-end">
          {canChangeRoleThis && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-sky-400 text-sky-600 hover:bg-sky-50 hover:text-sky-700"
              onClick={() => setEditRoleOpen(true)}
            >
              Đổi vai trò
            </Button>
          )}

          {canChangePermThis && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-sky-400 text-sky-600 hover:bg-sky-50 hover:text-sky-700"
              onClick={() => setEditPermOpen(true)}
            >
              Quyền
            </Button>
          )}
          {canBanThis && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-amber-400 text-amber-700 hover:bg-amber-50"
              onClick={() => setBanOpen(true)}
            >
              Chặn
            </Button>
          )}

          {canKickThis && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setRemoveOpen(true)}
            >
              Xóa
            </Button>
          )}

          {canUnbanThis && (
            <Button
              size="sm"
              className="text-xs bg-sky-500 hover:bg-sky-600 text-white"
              onClick={() => setUnbanOpen(true)}
            >
              Gỡ chặn
            </Button>
          )}
        </div>
      </div>

      {/* các dialog bên dưới: chỉ đổi màu nút confirm sang sky cho non-destructive */}
      {/* Ban dialog (giữ đỏ) */}
      <AlertDialog open={banOpen} onOpenChange={setBanOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chặn thành viên khỏi nhóm?</AlertDialogTitle>
            <AlertDialogDescription>
              Thành viên <b>{displayName}</b> sẽ bị chặn và không thể tham gia
              lại nhóm cho đến khi được gỡ chặn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={banning}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={banning}
              onClick={() => {
                banMemberMutate(member.id);
              }}
            >
              {banning ? 'Đang chặn...' : 'Chặn thành viên'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unban dialog (sky) */}
      <AlertDialog open={unbanOpen} onOpenChange={setUnbanOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gỡ chặn thành viên?</AlertDialogTitle>
            <AlertDialogDescription>
              Thành viên <b>{displayName}</b> sẽ được phép tham gia lại nhóm nếu
              được chấp thuận.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unbanning}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-sky-500 hover:bg-sky-600 text-white"
              disabled={unbanning}
              onClick={() => {
                unbanMemberMutate(member.id);
              }}
            >
              {unbanning ? 'Đang gỡ...' : 'Gỡ chặn'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Kick dialog */}
      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-600">
              Xoá thành viên khỏi nhóm?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Thành viên <b>{displayName}</b> sẽ bị xoá khỏi nhóm. Họ vẫn có thể
              xin tham gia lại sau này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              disabled={removing}
              onClick={() => {
                removeMember(member.id);
              }}
            >
              {removing ? 'Đang xoá...' : 'Xác nhận xoá'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change role dialog */}
      <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle>Cập nhật vai trò</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <ChangeRoleForm
              member={member}
              currentUserRole={currentRole}
              onSubmit={(newRole) => {
                changeRoleMutate({ memberId: member.id, newRole });
                setEditRoleOpen(false);
              }}
              isSubmitting={changingRole}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Change permission dialog */}
      <Dialog open={editPermOpen} onOpenChange={setEditPermOpen}>
        <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-sky-600">
              Cập nhật quyền thành viên
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <ChangePermissionForm
              member={member}
              onSubmit={(perms) => {
                changePermMutate({ memberId: member.id, permissions: perms });
                setEditPermOpen(false);
              }}
              isSubmitting={changingPerm}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const getDisplayName = (user?: UserDTO): string => {
  if (!user) return '';
  if (user.firstName || user.lastName) {
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  }
  return 'Chưa đặt tên';
};
