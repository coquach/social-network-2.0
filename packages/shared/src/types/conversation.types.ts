/**
 * Conversation Types
 * Platform-agnostic conversation-related type definitions
 */

import type { AttachmentDTO, MessageDTO } from './message.types';

/**
 * Conversation data transfer object
 */
export interface ConversationDTO {
  _id: string;
  isGroup: boolean;
  participants: string[];
  admins: string[];
  groupName?: string;
  groupAvatar?: AttachmentDTO;
  lastMessage?: MessageDTO;
  createdAt: Date;
  updatedAt?: Date;
  lastSeenMessageId?: Map<string, string>;
  hiddenFor?: string[];
  activeCallId?: string;
}

/**
 * Minimal conversation data for lists
 */
export interface ConversationSnapshotDTO {
  _id: string;
  isGroup: boolean;
  name: string;
  avatarUrl?: string;
  lastMessagePreview?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isOnline?: boolean;
}

/**
 * Conversation with participant details
 */
export interface ConversationWithParticipantsDTO extends ConversationDTO {
  participantDetails: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
    isOnline?: boolean;
  }>;
}

/**
 * Online status for conversation participants
 */
export interface OnlineStatusDTO {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: Date;
}

/**
 * Input types for conversation operations
 */
export interface CreateConversationInput {
  isGroup: boolean;
  participants: string[];
  groupName?: string;
  groupAvatar?: AttachmentDTO;
}

export interface UpdateConversationInput {
  groupName?: string;
  groupAvatar?: AttachmentDTO;
  participantsToAdd?: string[];
  participantsToRemove?: string[];
}

export interface LeaveConversationInput {
  conversationId: string;
}
