import { z } from 'zod';
import { GroupPrivacy, MediaType } from '../types/enums';

export const GroupMediaInputSchema = z.object({
  type: z.enum(MediaType),
  url: z.url(),
  publicId: z.string().optional(),
});

export const CreateGroupInputSchema = z.object({
  name: z.string().max(100, 'Group name is too long!'),
  description: z.string().max(1000, 'Description is too long!').optional(),
  avatar: GroupMediaInputSchema.optional(),
  coverImage: GroupMediaInputSchema.optional(),
  privacy: z.enum(GroupPrivacy),
  rules: z.string().max(2000, 'Rules is too long!').optional(),
  groupCategoryId: z.string().optional(),
});

export const UpdateGroupInputSchema = CreateGroupInputSchema.partial().extend({});

export const CreateGroupReportInputSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
});
