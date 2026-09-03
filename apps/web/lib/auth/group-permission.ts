import { GroupPermission } from '@repo/shared/types/enums';
import { GroupRole } from '@repo/shared/types/enums';
import { ROLE_PERMISSIONS } from "@/utils/constants";

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
