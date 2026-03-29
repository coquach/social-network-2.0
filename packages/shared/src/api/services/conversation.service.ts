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
import { normalizeConversation, normalizeConversationPage } from '../../utils';

export const conversationService = {
  /**
   * Get all conversations (paginated)
   */
  async getConversations(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<CursorPageResponse<ConversationDTO>> {
    const response = await getApiClient().getCursorPage<ConversationDTO>(
      '/chats/conversations',
      { params }
    );
    return normalizeConversationPage(response as CursorPageResponse<any>);
  },

  /**
   * Get single conversation by ID
   */
  async getConversation(
    conversationId: string
  ): Promise<ConversationWithParticipantsDTO> {
    const response = await getApiClient().get<ConversationWithParticipantsDTO>(
      `/chats/conversations/${conversationId}`
    );
    return normalizeConversation(response as any);
  },

  /**
   * Create new conversation
   */
  async createConversation(
    data: CreateConversationInput
  ): Promise<ConversationDTO> {
    const response = await getApiClient().post<ConversationDTO>(
      '/chats/conversations',
      data
    );
    return normalizeConversation(response as any);
  },

  /**
   * Update conversation (group name, avatar, participants)
   */
  async updateConversation(
    conversationId: string,
    data: UpdateConversationInput
  ): Promise<ConversationDTO> {
    const response = await getApiClient().put<ConversationDTO>(
      `/chats/conversations/${conversationId}`,
      data
    );
    return normalizeConversation(response as any);
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
