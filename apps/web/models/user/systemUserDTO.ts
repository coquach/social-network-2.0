import z from 'zod';

export enum SystemRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
}

export const CreateSystemUserSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(SystemRole),
});

export type CreateSystemUserDTO = z.infer<typeof CreateSystemUserSchema>;


export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
  DELETED = 'DELETED',
}

export interface SystemUserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: SystemRole;
  status: UserStatus;
  createdAt: Date;
}
