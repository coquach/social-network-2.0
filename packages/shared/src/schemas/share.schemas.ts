import { z } from 'zod';
import { Audience } from '../types/enums';

export const CreateShareInputSchema = z.object({
  postId: z.string(),
  audience: z.enum(Audience).optional(),
  content: z.string().min(1).max(2000, 'Mô tả quá dài!'),
});

export const UpdateShareInputSchema = CreateShareInputSchema.partial().extend({});
