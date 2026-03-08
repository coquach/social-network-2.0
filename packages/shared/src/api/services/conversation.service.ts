/**
 * Conversation Service
 * Platform-agnostic conversation-related API operations
 */

import { getApiClient } from '../client';
import type {
  ConversationDTO,
  ConversationWithParticipantsDTO,
  CreateConversationInput,
  UpdateConversationInput,
  CursorPaginatedResponse,
} from '../../types';

export const conversationService = {
  /**
   * Get all conversations (paginated)
   */
  async getConversations(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<CursorPaginatedResponse<ConversationDTO>> {
    return getApiClient().get('/conversations', { params });
  },

  /**
   * Get single conversation by ID
   */
  async getConversation(
    conversationId: string
  ): Promise<ConversationWithParticipantsDTO> {
    return getApiClient().get(`/conversations/${conversationId}`);
  },

  /**
   * Create new conversation
   */
  async createConversation(
    data: CreateConversationInput
  ): Promise<ConversationDTO> {
    return getApiClient().post('/conversations', data);
  },

  /**
   * Update conversation (group name, avatar, participants)
   */
  async updateConversation(
    conversationId: string,
    data: UpdateConversationInput
  ): Promise<ConversationDTO> {
    return getApiClient().patch(`/conversations/${conversationId}`, data);
  },

  /**
   * Leave conversation
   */
  async leaveConversation(conversationId: string): Promise<void> {
    return getApiClient().post(`/conversations/${conversationId}/leave`);
  },

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    return getApiClient().delete(`/conversations/${conversationId}`);
  },

  /**
   * Mark conversation as read
   */
  async markConversationAsRead(conversationId: string): Promise<void> {
    return getApiClient().post(`/conversations/${conversationId}/mark-read`);
  },

  /**
   * Hide conversation
   */
  async hideConversation(conversationId: string): Promise<void> {
    return getApiClient().post(`/conversations/${conversationId}/hide`);
  },

  /**
   * Unhide conversation
   */
  async unhideConversation(conversationId: string): Promise<void> {
    return getApiClient().post(`/conversations/${conversationId}/unhide`);
  },

  /**
   * Add participants to group conversation
   */
  async addParticipants(
    conversationId: string,
    participantIds: string[]
  ): Promise<void> {
    return getApiClient().post(`/conversations/${conversationId}/participants`, {
      participantIds,
    });
  },

  /**
   * Remove participant from group conversation
   */
  async removeParticipant(
    conversationId: string,
    participantId: string
  ): Promise<void> {
    return getApiClient().delete(
      `/conversations/${conversationId}/participants/${participantId}`
    );
  },

  /**
   * Get or create direct conversation with a user
   */
  async getOrCreateDirect(userId: string): Promise<ConversationDTO> {
    return getApiClient().post('/conversations/direct', { userId });
  },
};
