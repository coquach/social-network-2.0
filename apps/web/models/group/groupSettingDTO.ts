import z from 'zod';

export const GroupSettingSchema = z.object({
  requiredPostApproval: z.boolean().optional(),
  maxMembers: z.number().int().min(1).optional(),
  requireAdminApprovalToJoin: z.boolean().optional(),
  allowMemberInvite: z.boolean().optional(),  
});

export const UpdateGroupSettingSchema = GroupSettingSchema.partial().extend({});

export type UpdateGroupSettingForm = z.infer<typeof UpdateGroupSettingSchema>;

export interface GroupSettingDTO {
  id: string;
  groupId: string;
  requiredPostApproval: boolean;
  allowMemberInvite: boolean;
  maxMembers: number;

  requireAdminApprovalToJoin: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
