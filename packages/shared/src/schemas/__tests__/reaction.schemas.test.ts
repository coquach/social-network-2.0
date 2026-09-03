import { describe, it, expect } from 'vitest';
import { CreateReactionInputSchema, RemoveReactionInputSchema } from '../reaction.schemas';
import { ReactionType, TargetType } from '../../types/enums';

describe('Reaction Schemas', () => {
  describe('CreateReactionInputSchema', () => {
    it('should validate a valid reaction', () => {
      const validData = {
        targetId: 'post-1',
        targetType: TargetType.POST,
        reactionType: ReactionType.LIKE,
      };
      
      const result = CreateReactionInputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail if missing targetId', () => {
      const invalidData = {
        targetType: TargetType.POST,
        reactionType: ReactionType.LIKE,
      };
      
      const result = CreateReactionInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('RemoveReactionInputSchema', () => {
    it('should validate a valid removal request', () => {
      const validData = {
        targetId: 'post-1',
        targetType: TargetType.POST,
      };
      
      const result = RemoveReactionInputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail if reactionType is provided but targetId is missing', () => {
      const invalidData = {
        targetType: TargetType.POST,
        reactionType: ReactionType.LIKE,
      };
      
      const result = RemoveReactionInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
