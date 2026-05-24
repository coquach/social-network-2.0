import { z } from 'zod';
import { RootType } from '../types/enums';
import { MediaSchema } from './post.schemas';

export const CreateCommentInputSchema = z.object({
  rootId: z.string(),
  rootType: z.enum(RootType),
  parentId: z.string().optional(),
  content: z.string().min(1, 'Content cannot empty').max(1000, 'Content is too long'),
  media: MediaSchema.optional(),
});

export const UpdateCommentInputSchema = CreateCommentInputSchema.partial().extend({});
