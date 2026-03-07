// contexts/group-permission-context.tsx
'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { GroupRole } from '@/models/group/enums/group-role.enum';
import { GroupPermission } from '@/models/group/enums/group-permission.enum';
import { GroupDTO } from '@/models/group/groupDTO';
import { useGroup } from '@repo/shared';
import { hasGroupPermission } from '@/lib/auth/group-permission';

type Ctx = {
  group: GroupDTO | undefined;
  role?: GroupRole;
  can: (p: GroupPermission) => boolean;
  isLoading: boolean;
  isError: boolean;
};

const GroupPermissionContext = createContext<Ctx | undefined>(undefined);

export const GroupPermissionProvider = ({
  groupId,
  children,
}: {
  groupId: string;
  children: ReactNode;
}) => {
  const { data: group, isLoading, isError } = useGroup(groupId);

  const value: Ctx = useMemo(
    () => ({
      group,
      role: group?.userRole,
      can: (permission: GroupPermission) =>
        hasGroupPermission(group?.userRole, permission),
      isLoading,
      isError,
    }),
    [group, isLoading, isError]
  );

  return (
    <GroupPermissionContext.Provider value={value}>
      {children}
    </GroupPermissionContext.Provider>
  );
};

export const useGroupPermissionContext = () => {
  const ctx = useContext(GroupPermissionContext);
  if (!ctx) {
    throw new Error(
      'useGroupPermissionContext must be used within GroupPermissionProvider'
    );
  }
  return ctx;
};
