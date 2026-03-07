import { GroupPermission } from "@/models/group/enums/group-permission.enum";
import { GroupRole } from "@/models/group/enums/group-role.enum";
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
