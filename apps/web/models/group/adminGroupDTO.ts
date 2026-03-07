import { GroupPrivacy } from './enums/group-privacy.enum';
import { GroupStatus } from './enums/group-status.enum';

interface GroupOwnerSnapshot {
  id: string;
  fullName: string;
  avatarUrl?: string;
}

export interface AdminGroupDTO {
  id: string;
  name: string;
  owner: GroupOwnerSnapshot;
  avatarUrl?: string;
  privacy: GroupPrivacy;
  members: number;
  reports: number;
  createdAt: Date;
  status?: GroupStatus;
}
