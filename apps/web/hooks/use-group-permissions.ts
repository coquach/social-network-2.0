import { hasGroupPermission } from "@/lib/auth/group-permission";
import {  GroupPermission  } from "@repo/shared";
import {  GroupRole  } from "@repo/shared";
import {  GroupDTO  } from "@repo/shared";
import { useMemo } from "react";

type UseGroupPermissionResult = {
  role?: GroupRole;
  can: (permission: GroupPermission) => boolean;
};

export const useGroupPermission = (
  group?: GroupDTO | null
): UseGroupPermissionResult => {
  const role = group?.userRole;

  const can = useMemo(
    () => (permission: GroupPermission) => hasGroupPermission(role, permission),
    [role]
  );

  return { role, can };
};
