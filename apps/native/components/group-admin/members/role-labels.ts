import { GroupRole } from '@repo/shared/types';

export const roleLabel: Record<GroupRole, string> = {
  OWNER: 'Chủ nhóm',
  ADMIN: 'Quản trị viên',
  MODERATOR: 'Người kiểm duyệt',
  MEMBER: 'Thành viên',
};

