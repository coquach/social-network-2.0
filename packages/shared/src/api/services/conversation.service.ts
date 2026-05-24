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
  CursorPageResponse,
} from '../../types';

export const conversationService = {
  /**
   * Get all conversations (paginated)
   */
  async getConversations(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<CursorPageResponse<ConversationDTO>> {
    return getApiClient().getCursorPage<ConversationDTO>(
      '/chats/conversations',
      { params }
    );
  },

  /**
   * Get single conversation by ID
   */
  async getConversation(
    conversationId: string
  ): Promise<ConversationWithParticipantsDTO> {
    return getApiClient().get<ConversationWithParticipantsDTO>(
      `/chats/conversations/${conversationId}`
    );
  },

  /**
   * Create new conversation
   */
  async createConversation(
    data: CreateConversationInput
  ): Promise<ConversationDTO> {
    return getApiClient().post<ConversationDTO>(
      '/chats/conversations',
      data
    );
  },

  /**
   * Update conversation (group name, avatar, participants)
   */
  async updateConversation(
    conversationId: string,
    data: UpdateConversationInput
  ): Promise<ConversationDTO> {
    return getApiClient().put<ConversationDTO>(
      `/chats/conversations/${conversationId}`,
      data
    );
  },

  /**
   * Leave conversation
   */
  async leaveConversation(conversationId: string): Promise<void> {
    return getApiClient().post(`/chats/conversations/${conversationId}/leave`);
  },

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    return getApiClient().delete(`/chats/conversations/${conversationId}`);
  },

  /**
   * Mark conversation as read
   */
  async markConversationAsRead(conversationId: string): Promise<void> {
    return getApiClient().post(`/chats/conversations/${conversationId}/read`, {});
  },

  /**
   * Hide conversation
   */
  async hideConversation(conversationId: string): Promise<void> {
    return getApiClient().post(`/chats/conversations/${conversationId}/hide`);
  },

  /**
   * Unhide conversation
   */
  async unhideConversation(conversationId: string): Promise<void> {
    return getApiClient().post(`/chats/conversations/${conversationId}/unhide`);
  },

  /**
   * Add participants to group conversation
   */
  async addParticipants(
    conversationId: string,
    participantIds: string[]
  ): Promise<ConversationDTO> {
    return conversationService.updateConversation(conversationId, {
      participantsToAdd: participantIds,
    });
  },

  /**
   * Remove participant from group conversation
   */
  async removeParticipant(
    conversationId: string,
    participantId: string
  ): Promise<ConversationDTO> {
    return conversationService.updateConversation(conversationId, {
      participantsToRemove: [participantId],
    });
  },

  /**
   * Get or create direct conversation with a user
   */
  async getOrCreateDirect(userId: string): Promise<ConversationDTO> {
    return conversationService.createConversation({
      isGroup: false,
      participants: [userId],
    });
  },
};
