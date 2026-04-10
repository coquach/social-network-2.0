/**
 * Message Service
 * Platform-agnostic messaging-related API operations
 */

import { getApiClient } from '../client';
import type {
  MessageDTO,
  CreateMessageInput,
  UpdateMessageInput,
  MarkAsReadInput,
  CursorPageResponse,
} from '../../types';

export const messageService = {
  /**
   * Get messages in a conversation (paginated)
   */
  async getMessages(
    conversationId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<CursorPageResponse<MessageDTO>> {
    return getApiClient().getCursorPage<MessageDTO>(
      `/chats/conversations/${conversationId}/messages`,
      {
        params,
      }
    );
  },

  /**
   * Get single message by ID
   */
  async getMessage(messageId: string): Promise<MessageDTO> {
    return getApiClient().get<MessageDTO>(`/chats/messages/${messageId}`);
  },

  /**
   * Send new message
   */
  async sendMessage(data: CreateMessageInput): Promise<MessageDTO> {
    return getApiClient().post<MessageDTO>('/chats/messages', data);
  },

  /**
   * Update message
   */
  async updateMessage(
    messageId: string,
    data: UpdateMessageInput
  ): Promise<MessageDTO> {
    return getApiClient().patch<MessageDTO>(
      `/chats/messages/${messageId}`,
      data
    );
  },

  /**
   * Delete message
   */
  async deleteMessage(messageId: string): Promise<void> {
    return getApiClient().delete(`/chats/messages/${messageId}`);
  },

  /**
   * Mark message as read
   */
  async markAsRead(data: MarkAsReadInput): Promise<void> {
    return getApiClient().post(`/chats/conversations/${data.conversationId}/read`, {
      lastMessageId: data.messageId,
    });
  },

  /**
   * Mark all messages in conversation as read
   */
  async markConversationAsRead(conversationId: string): Promise<void> {
    return getApiClient().post(`/chats/conversations/${conversationId}/read`, {});
  },

  /**
   * React to message
   */
  async reactToMessage(
    messageId: string,
    reaction: string
  ): Promise<void> {
    return getApiClient().post(`/chats/messages/${messageId}/reactions`, {
      reaction,
    });
  },

  /**
   * Remove reaction from message
   */
  async removeReaction(messageId: string): Promise<void> {
    return getApiClient().delete(`/chats/messages/${messageId}/reactions`);
  },

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(
    conversationId: string,
    isTyping: boolean
  ): Promise<void> {
    return getApiClient().post(`/conversations/${conversationId}/typing`, {
      isTyping,
    });
  },
};
