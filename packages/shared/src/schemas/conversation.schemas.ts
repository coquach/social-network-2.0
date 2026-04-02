import { z } from 'zod';

export const ConversationAttachmentSchema = z.object({
  url: z.url(),
  publicId: z.string().optional(),
  mimeType: z.string().optional(),
  fileName: z.string().optional(),
  size: z.number().optional(),
  thumbnailUrl: z.url().optional(),
});

export const CreateConversationInputSchema = z
  .object({
    isGroup: z.boolean(),
    participants: z.array(z.string()).min(1, 'Participants cannot be empty'),
    groupName: z
      .string()
      .trim()
      .min(1)
      .max(100, 'Group name must be between 1 and 100 characters')
      .optional(),
    groupAvatar: ConversationAttachmentSchema.optional(),
  })
  .strict();

export const UpdateConversationInputSchema = z
  .object({
    groupName: z.string().trim().min(1).optional(),
    groupAvatar: ConversationAttachmentSchema.optional(),
    participantsToAdd: z.array(z.string().min(1)).optional(),
    participantsToRemove: z.array(z.string().min(1)).optional(),
  })
  .strict();
