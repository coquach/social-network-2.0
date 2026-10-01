/**
 * Chatbot Types
 * Platform-agnostic assistant/chatbot type definitions
 */

import type { CursorPageResponse } from './common.types';

export interface AssistantMessageInput {
  message: string;
  clientMessageId?: string;
}

export interface AssistantSourceDTO {
  type: string;
  id: string;
  title?: string | null;
  source?: string | null;
  score?: number | null;
}

export interface AssistantSuggestedActionDTO {
  type: string;
  label: string;
  payload: Record<string, unknown>;
}

export interface AssistantRespondDataDTO {
  reply: string;
  sources: AssistantSourceDTO[];
  suggestedActions: AssistantSuggestedActionDTO[];
  model: string;
  provider: string;
}

export interface ChatbotHistoryMessageDTO {
  id: string;
  conversationId: string;
  userId: string;
  role: string;
  content: string;
  intent?: string | null;
  sources: AssistantSourceDTO[];
  metadata: Record<string, unknown>;
  createdAt: string;
}

export type ChatbotHistoryPageDTO = CursorPageResponse<ChatbotHistoryMessageDTO>;

export interface ChatbotHistoryQuery {
  cursor?: string;
  limit?: number;
}

export interface ChatbotClearHistoryResultDTO {
  deletedCount: number;
  sessionCleared: boolean;
}
