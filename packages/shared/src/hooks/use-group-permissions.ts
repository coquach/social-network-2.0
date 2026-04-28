
import { useMemo } from "react";
import { GroupDTO, GroupPermission, GroupRole } from "../types";
import { ROLE_PERMISSIONS } from "../utils/constants";

export const hasGroupPermission = (
  role: GroupRole | undefined,
  permission: GroupPermission
) => {
  if (!role) return false;

  // OWNER có full quyền
  if (role === GroupRole.OWNER) return true;

  const allowed = ROLE_PERMISSIONS[role] ?? [];
  return allowed.includes(permission);
};


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
