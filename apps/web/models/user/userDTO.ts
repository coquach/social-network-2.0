import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  coverImageUrl: z.string().optional(),
  coverImage: z
    .object({
      url: z.string().optional(),
      publicId: z.string().optional(),
    })
    .optional(),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
});

export const ProfileUpdateSchema = UserSchema.partial().extend({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  avatarUrl: z.union([z.url(), z.instanceof(File)]).optional(),
  coverImageUrl: z.union([z.url(), z.instanceof(File)]).optional(),
  isActive: z.boolean().optional(),
});

export type UserCreateForm = z.infer<typeof UserSchema>;

export type ProfileUpdateForm = z.infer<typeof ProfileUpdateSchema>
export type UserDTO = {
  id: string;
  email: string;
  isActive: boolean;
  firstName: string;
  lastName: string;
  coverImageUrl?: string;
  coverImage?: {
    url?: string;
    publicId?: string;
  };
  avatarUrl: string;
  bio: string;
  createdAt: Date;
  relation: {
    status: string;
  };
};

