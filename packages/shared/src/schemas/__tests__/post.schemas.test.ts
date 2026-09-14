import { describe, it, expect } from 'vitest';
import { CreatePostInputSchema, UpdatePostInputSchema } from '../post.schemas';
import { Audience, Emotion, MediaType } from '../../types/enums';

describe('Post Schemas', () => {
  describe('CreatePostInputSchema', () => {
    it('should validate a valid post', () => {
      const validData = {
        content: 'Hello world',
        feeling: Emotion.HAPPY,
        audience: Audience.PUBLIC,
      };
      
      const result = CreatePostInputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail if content is empty', () => {
      const invalidData = {
        content: '',
      };
      
      const result = CreatePostInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Content cannot empty');
      }
    });

    it('should fail if content is too long', () => {
      const invalidData = {
        content: 'a'.repeat(2001),
      };
      
      const result = CreatePostInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Content is too long');
      }
    });

    it('should validate media correctly', () => {
      const validData = {
        content: 'Hello',
        media: [
          {
            type: MediaType.IMAGE,
            url: 'https://example.com/image.jpg',
            publicId: 'abc',
          }
        ]
      };
      
      const result = CreatePostInputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('UpdatePostInputSchema', () => {
    it('should allow partial updates', () => {
      const validData = {
        content: 'Updated content',
      };
      
      const result = UpdatePostInputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
