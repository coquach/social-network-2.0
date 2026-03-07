'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useGroupPermissionContext } from '@/contexts/group-permission-context';
import { GroupRole } from '@/models/group/enums/group-role.enum';

const ADMIN_ROLES = new Set<GroupRole>([
  GroupRole.OWNER,
  GroupRole.ADMIN,
  GroupRole.MODERATOR,
]);

export const GroupAdminGuard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { role, isLoading, isError } = useGroupPermissionContext();
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const groupId = params?.groupId;

  if (isLoading) {
    return null; // hoặc một spinner/loading indicator
  }

  const allowed = !!role && ADMIN_ROLES.has(role);
  if (!allowed || isError) {
    router.replace(groupId ? `/groups/${groupId}` : '/groups');
    return null; // Đang chuyển hướng, không hiển thị gì cả
  }

  return <>{children}</>;
};
