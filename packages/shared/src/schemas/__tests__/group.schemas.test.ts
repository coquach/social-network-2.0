import { describe, it, expect } from 'vitest';
import { CreateGroupInputSchema, UpdateGroupInputSchema } from '../group.schemas';
import { GroupPrivacy } from '../../types/enums';

describe('Group Schemas', () => {
  describe('CreateGroupInputSchema', () => {
    it('validates a correct payload', () => {
      const payload = {
        name: 'React Developers',
        description: 'A group for React developers',
        privacy: GroupPrivacy.PUBLIC,
      };
      
      const result = CreateGroupInputSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('fails when name exceeds max length', () => {
      const payload = {
        name: 'a'.repeat(101),
        privacy: GroupPrivacy.PUBLIC,
      };
      
      const result = CreateGroupInputSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Group name is too long!');
      }
    });

    it('fails when privacy is missing', () => {
      const payload = {
        name: 'Valid Name',
      };
      
      const result = CreateGroupInputSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateGroupInputSchema', () => {
    it('validates a correct payload', () => {
      const payload = {
        name: 'React JS Developers',
      };
      
      const result = UpdateGroupInputSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });
});
