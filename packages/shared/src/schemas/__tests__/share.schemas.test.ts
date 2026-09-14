import { describe, it, expect } from 'vitest';
import { CreateShareInputSchema, UpdateShareInputSchema } from '../share.schemas';
import { Audience } from '../../types/enums';

describe('Share Schemas', () => {
  describe('CreateShareInputSchema', () => {
    it('should validate a valid share', () => {
      const validData = {
        postId: 'post-1',
        audience: Audience.PUBLIC,
        content: 'Check this out!',
      };
      
      const result = CreateShareInputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail if content is too long', () => {
      const invalidData = {
        postId: 'post-1',
        content: 'a'.repeat(2001),
      };
      
      const result = CreateShareInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Mô tả quá dài!');
      }
    });

    it('should fail if postId is missing', () => {
      const invalidData = {
        content: 'Cool',
      };
      
      const result = CreateShareInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
