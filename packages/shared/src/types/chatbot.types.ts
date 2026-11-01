/**
 * Chatbot Types
 * Platform-agnostic assistant/chatbot type definitions
 */

import type { CursorPageResponse } from './common.types';

export interface SurfaceContextDTO {
  screen: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export interface AssistantMessageInput {
  message: string;
  clientMessageId?: string;
  surface?: SurfaceContextDTO;
}

export interface AssistantSourceDTO {
  type: string;
  id: string;
  title?: string | null;
  source?: string | null;
  score?: number | null;
}

export interface AssistantNavigateAction {
  type: 'navigate';
  id: string;
  label: string;
  payload: {
    destinationId: string;
    params?: Record<string, string>;
  };
}

export type AssistantCardType = 'profile' | 'group' | 'post' | 'music' | 'emotion';

export interface AssistantCardPayload {
  cardType: AssistantCardType;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

export interface AssistantShowCardAction {
  type: 'show_card';
  id: string;
  label: string;
  payload: AssistantCardPayload;
}

/** Discriminated by `type`; extend this union when new action kinds are added. */
export type AssistantSuggestedActionDTO = AssistantNavigateAction | AssistantShowCardAction;

/** Shape of `metadata` on assistant chat messages (the rest of the bag is untyped). */
export interface AssistantMessageMetadata {
  actions?: AssistantSuggestedActionDTO[];
  cards?: AssistantShowCardAction[];
  [key: string]: unknown;
}

export interface AssistantRespondDataDTO {
  reply: string;
  sources: AssistantSourceDTO[];
  suggestedActions: AssistantSuggestedActionDTO[];
  cards?: AssistantShowCardAction[];
  model: string;
  provider: string;
  requestId?: string;
  latencyMs?: number;
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
