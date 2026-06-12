
import { useMemo } from "react";
import { GroupDTO, GroupPermission, GroupRole } from "../types";
import { ROLE_PERMISSIONS } from "../utils/constants";

export const hasGroupPermission = (
  role: GroupRole | undefined,
  permission: GroupPermission,
  groupSetting?: { allowMemberInvite?: boolean }
) => {
  if (!role) return false;

  // OWNER có full quyền
  if (role === GroupRole.OWNER) return true;

  const allowed = ROLE_PERMISSIONS[role] ?? [];
  if (allowed.includes(permission)) return true;

  if (permission === GroupPermission.INVITE_MEMBERS && role === GroupRole.MEMBER && groupSetting?.allowMemberInvite) {
    return true;
  }

  return false;
};


type UseGroupPermissionResult = {
  role?: GroupRole;
  can: (permission: GroupPermission) => boolean;
};

export const useGroupPermission = (
  group?: GroupDTO | null
): UseGroupPermissionResult => {
  const role = group?.userRole;
  const groupSetting = group?.groupSetting;

  const can = useMemo(
    () => (permission: GroupPermission) => hasGroupPermission(role, permission, groupSetting),
    [role, groupSetting]
  );

  return { role, can };
};
