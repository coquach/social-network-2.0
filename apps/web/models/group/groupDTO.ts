import { z } from 'zod';
import { GroupPrivacy } from "./enums/group-privacy.enum";
import { GroupStatus } from "./enums/group-status.enum";
import { GroupRole } from "./enums/group-role.enum";
import { MediaType } from "../social/enums/social.enum";

export const GroupSchema = z.object({
  name: z.string().max(100, 'Group name is too long!'),
  description: z.string().max(1000, 'Description is too long!').optional(),
  avatar: z.object(
    {
      type: z.enum(MediaType),
      url: z.url(),
      publicId: z.string().optional(),
    },
  ).optional(),
  coverImage : z.object({
    type: z.enum(MediaType),
    url: z.url(),
    publicId: z.string().optional(),
  }).optional(),
  privacy: z.enum(GroupPrivacy),
  rules: z.string().max(2000, 'Rules is too long!').optional(),
  groupCategoryId: z.uuid().optional(),
});

export type CreateGroupForm = z.infer<typeof GroupSchema>;

export const UpdateGroupSchema = GroupSchema.partial().extend({});

export type UpdateGroupForm = z.infer<typeof UpdateGroupSchema>;

export enum MembershipStatus {
  NONE = 'NONE',
  MEMBER = 'MEMBER',
  INVITED = 'INVITED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  BANNED = 'BANNED',
}

export interface GroupSettingEmbbedDTO {
  requiredPostApproval: boolean;
  maxMembers: number;
  allowMemberInvite: boolean;
}

export interface GroupDTO {
  id: string;
  name: string;
  description?: string;
  avatarUrl: string;
  coverImageUrl?: string;
  privacy: GroupPrivacy;
  rules?: string;
  members: number;
  status: GroupStatus;
  createdAt: Date;
  userRole?: GroupRole;
  membershipStatus?: MembershipStatus;
  groupSetting?: GroupSettingEmbbedDTO;
}

export interface GroupSummaryDTO {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  privacy: GroupPrivacy;
  members: number;
  createdAt: Date;
}
