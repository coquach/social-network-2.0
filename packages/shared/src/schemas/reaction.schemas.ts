import { z } from 'zod';
import { ReactionType, TargetType } from '../types/enums';

export const CreateReactionInputSchema = z.object({
  targetId: z.string(),
  targetType: z.enum(TargetType),
  reactionType: z.enum(ReactionType),
});

export const RemoveReactionInputSchema = CreateReactionInputSchema.pick({
  targetId: true,
  targetType: true,
});
