import { z } from 'zod';

export const AttachmentSchema = z.object({
  url: z.url(),
  publicId: z.string().optional(),
  mimeType: z.string().optional(),
  fileName: z.string().optional(),
  size: z.number().optional(),
  thumbnailUrl: z.url().optional(),
});

export const CreateMessageInputSchema = z.object({
  content: z.string().max(2000, 'Content exceeds maximum length of 2000 characters'),
  conversationId: z.string(),
  attachments: z.array(AttachmentSchema).optional(),
  replyTo: z.string().optional(),
});

export const UpdateMessageInputSchema = z.object({
  content: z.string().max(2000, 'Content exceeds maximum length of 2000 characters').optional(),
});
