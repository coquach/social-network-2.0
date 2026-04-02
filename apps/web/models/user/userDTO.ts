import { z } from 'zod';

export type { UserDTO } from '@repo/shared';
export {
  INTEREST_OPTIONS,
  UserSchema,
  UpdateUserInputSchema,
} from '@repo/shared/schemas';

import {
  INTEREST_OPTIONS,
  UpdateUserInputSchema,
  UserSchema,
} from '@repo/shared/schemas';

const interestSchema = z.enum(INTEREST_OPTIONS);

export const ProfileUpdateSchema = UpdateUserInputSchema.extend({
  firstName: z
    .string()
    .trim()
    .min(1, 'Tên là bắt buộc')
    .max(100, 'Tên tối đa 100 ký tự'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Họ và tên đệm là bắt buộc')
    .max(100, 'Họ và tên đệm tối đa 100 ký tự'),
  interests: z
    .array(interestSchema)
    .max(10, 'Chỉ chọn tối đa 10 sở thích')
    .optional(),
  avatarUrl: z.union([z.url(), z.instanceof(File)]).optional(),
  coverImageUrl: z.union([z.url(), z.instanceof(File)]).optional(),
});

export type UserCreateForm = z.infer<typeof UserSchema>;
export type ProfileUpdateForm = z.infer<typeof ProfileUpdateSchema>;
