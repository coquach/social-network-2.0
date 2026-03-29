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
import { normalizeMessage, normalizeMessagePage } from '../../utils';

export const messageService = {
  /**
   * Get messages in a conversation (paginated)
   */
  async getMessages(
    conversationId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<CursorPageResponse<MessageDTO>> {
    const response = await getApiClient().getCursorPage<MessageDTO>(
      `/chats/conversations/${conversationId}/messages`,
      {
        params,
      }
    );
    return normalizeMessagePage(response as CursorPageResponse<any>);
  },

  /**
   * Get single message by ID
   */
  async getMessage(messageId: string): Promise<MessageDTO> {
    const response = await getApiClient().get<MessageDTO>(`/chats/messages/${messageId}`);
    return normalizeMessage(response as any);
  },

  /**
   * Send new message
   */
  async sendMessage(data: CreateMessageInput): Promise<MessageDTO> {
    const response = await getApiClient().post<MessageDTO>('/chats/messages', data);
    return normalizeMessage(response as any);
  },

  /**
   * Update message
   */
  async updateMessage(
    messageId: string,
    data: UpdateMessageInput
  ): Promise<MessageDTO> {
    const response = await getApiClient().patch<MessageDTO>(
      `/chats/messages/${messageId}`,
      data
    );
    return normalizeMessage(response as any);
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
