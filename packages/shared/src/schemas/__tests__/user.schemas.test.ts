import { describe, it, expect } from 'vitest';
import { UpdateUserInputSchema } from '../user.schemas';

describe('User Schemas', () => {
  describe('UpdateUserInputSchema', () => {
    it('validates a correct payload', () => {
      const payload = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Hello world',
        interests: ['Công nghệ', 'Du lịch'],
      };
      
      const result = UpdateUserInputSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('fails when firstName is empty', () => {
      const payload = {
        firstName: '',
      };
      
      const result = UpdateUserInputSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Tên là bắt buộc');
      }
    });

    it('fails when bio exceeds max length', () => {
      const payload = {
        bio: 'a'.repeat(256),
      };
      
      const result = UpdateUserInputSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Tiểu sử tối đa 255 ký tự');
      }
    });

    it('fails when interests exceed max length', () => {
      const payload = {
        interests: Array(11).fill('Music'),
      };
      
      const result = UpdateUserInputSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Chỉ chọn tối đa 10 sở thích');
      }
    });
  });
});
