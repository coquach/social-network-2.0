import z from 'zod';
import { AttachmentDTO, MessageDTO } from '../message/messageDTO';

export const ConversarionSchema = z
  .object({
    isGroup: z.boolean(),
    participants: z.array(z.string()).min(1, 'Participants cannot be empty'),
    groupName: z.string().trim().min(1).max(100, 'Group name must be between 1 and 100 characters').optional(),
    groupAvatar: z
      .object({
        url: z.url(),
        publicId: z.string().optional(),
      })
      .optional(),
  })
  .strict();

export type CreateConversationForm = z.infer<typeof ConversarionSchema>;

export const UpdateConversationSchema = z
  .object({
    groupName: z.string().trim().min(1).optional(),
    groupAvatar: z
      .object({
        url: z.url(),
        publicId: z.string().optional(),
      })
      .optional(),
    participantsToAdd: z.array(z.string().min(1)).optional(),
    participantsToRemove: z.array(z.string().min(1)).optional(),
  })
  .strict();

export type UpdateConversationForm = z.infer<typeof UpdateConversationSchema>;

export interface ConversationDTO {
  _id: string;
  isGroup: boolean;
  participants: string[];
  admins: string[];
  groupName?: string;
  groupAvatar?: AttachmentDTO;
  lastMessage: MessageDTO;
  createdAt: Date;
  updatedAt?: Date;
  lastSeenMessageId: Map<string, string>;
  hiddenFor?: string[];
}
