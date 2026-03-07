/**
 * Message Types
 * Platform-agnostic messaging-related type definitions
 */

import type { MessageStatus } from './enums';

/**
 * File/media attachment in messages
 */
export interface AttachmentDTO {
  url: string;
  publicId?: string;
  mimeType?: string;
  fileName?: string;
  size?: number;
  thumbnailUrl?: string;
}

/**
 * Reaction statistics for messages
 */
export interface ReactionStatsDTO {
  [reaction: string]: number;
}

/**
 * Message data transfer object
 */
export interface MessageDTO {
  _id: string;
  senderId: string;
  content: string;
  conversationId: string;
  status: MessageStatus;
  seenBy: string[];
  reactionStats?: ReactionStatsDTO;
  attachments?: AttachmentDTO[];
  replyTo?: MessageDTO;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  clientStatus?: 'sending' | 'failed';
}

/**
 * Minimal message data for lists
 */
export interface MessageSnapshotDTO {
  _id: string;
  senderId: string;
  content: string;
  hasAttachments: boolean;
  isDeleted: boolean;
  createdAt: Date;
}

/**
 * Typing indicator
 */
export interface TypingIndicatorDTO {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

/**
 * Input types for message operations
 */
export interface CreateMessageInput {
  conversationId: string;
  content: string;
  attachments?: AttachmentDTO[];
  replyTo?: string;
}

export interface UpdateMessageInput {
  content?: string;
}

export interface MarkAsReadInput {
  conversationId: string;
  messageId: string;
}
