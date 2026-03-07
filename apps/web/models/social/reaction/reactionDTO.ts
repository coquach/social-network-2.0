import z from 'zod';
import { ReactionType, TargetType } from '../enums/social.enum';

export const ReactionSchema = z.object({
  targetId: z.uuid(),
  targetType: z.enum(TargetType),
  reactionType: z.enum(ReactionType),
});

export type CreateReactionForm = z.infer<typeof ReactionSchema>;

export const DisReactionSchema = ReactionSchema.pick({
  targetId: true,
  targetType: true,
});

export type DisReactionForm = z.infer<typeof DisReactionSchema>;

export interface ReactionDTO {
  id: string;
  userId: string;
  reactionType: ReactionType;
}
