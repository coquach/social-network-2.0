import { z } from 'zod';
import { Audience, Emotion, MediaType } from '../types/enums';

export const MediaSchema = z.object({
  type: z.enum(MediaType),
  url: z.url(),
  publicId: z.string().optional(),
});

export const CreatePostInputSchema = z.object({
  groupId: z.string().optional(),
  feeling: z.enum(Emotion).optional(),
  content: z.string().min(1, 'Content cannot empty').max(2000, 'Content is too long'),
  media: z.array(MediaSchema).optional(),
  audience: z.enum(Audience).default(Audience.PUBLIC),
});

export const UpdatePostInputSchema = CreatePostInputSchema.partial().extend({});
