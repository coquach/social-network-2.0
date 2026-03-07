import { hasGroupPermission } from "@/lib/auth/group-permission";
import { GroupPermission } from "@/models/group/enums/group-permission.enum";
import { GroupRole } from "@/models/group/enums/group-role.enum";
import { GroupDTO } from "@/models/group/groupDTO";
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
