import { GroupMemberStatus } from "./enums/group-member-status.enum";
import { GroupPermission } from "./enums/group-permission.enum";
import { GroupRole } from "./enums/group-role.enum";

export interface GroupMemberDTO {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  groupId: string;
  status: GroupMemberStatus;
  role: GroupRole;
  customPermissions: GroupPermission[];
}