import { describe, it, expect } from 'vitest';
import { CreateCommentInputSchema } from '../comment.schemas';
import { RootType } from '../../types/enums';

describe('Comment Schemas', () => {
  describe('CreateCommentInputSchema', () => {
    it('validates a correct payload', () => {
      const payload = {
        rootId: 'post_123',
        rootType: RootType.POST,
        content: 'This is a comment',
      };
      
      const result = CreateCommentInputSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('fails when content is empty', () => {
      const payload = {
        rootId: 'post_123',
        rootType: RootType.POST,
        content: '',
      };
      
      const result = CreateCommentInputSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Content cannot empty');
      }
    });

    it('fails when content exceeds max length', () => {
      const payload = {
        rootId: 'post_123',
        rootType: RootType.POST,
        content: 'a'.repeat(1001),
      };
      
      const result = CreateCommentInputSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Content is too long');
      }
    });

    it('fails when rootType is invalid', () => {
      const payload = {
        rootId: 'post_123',
        rootType: 'INVALID_TYPE',
        content: 'Test',
      };
      
      const result = CreateCommentInputSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});
