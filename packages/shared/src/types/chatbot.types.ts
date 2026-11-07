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

export type AssistantActionCategory =
  | 'social'
  | 'group'
  | 'content'
  | 'notification'
  | (string & {});

export type AssistantExecutableActionName =
  | 'send_friend_request'
  | 'accept_friend_request'
  | 'decline_friend_request'
  | 'cancel_friend_request'
  | 'unfriend_user'
  | 'block_user'
  | 'join_group'
  | 'leave_group'
  | 'react_post'
  | 'mark_all_notifications_read'
  | (string & {});

export interface AssistantProposeActionPayload {
  actionName: AssistantExecutableActionName;
  title: string;
  description: string;
  params: Record<string, unknown>;
  idempotencyKey: string;
  confirmLabel?: string;
  cancelLabel?: string;
  category?: AssistantActionCategory;
  isDestructive?: boolean;
  expiresAt?: string;
  status?: 'idle' | 'executing' | 'success' | 'cancelled' | 'error';
  executionResult?: {
    success: boolean;
    message?: string;
  };
}

export interface AssistantProposeAction {
  type: 'propose_action';
  id: string;
  label: string;
  payload: AssistantProposeActionPayload;
}

/** Discriminated by `type`; extend this union when new action kinds are added. */
export type AssistantSuggestedActionDTO =
  | AssistantNavigateAction
  | AssistantShowCardAction
  | AssistantProposeAction;

/** Shape of `metadata` on assistant chat messages (the rest of the bag is untyped). */
export interface AssistantMessageMetadata {
  actions?: AssistantSuggestedActionDTO[];
  cards?: AssistantShowCardAction[];
  proposals?: AssistantProposeAction[];
  [key: string]: unknown;
}

export interface AssistantRespondDataDTO {
  reply: string;
  sources: AssistantSourceDTO[];
  suggestedActions: AssistantSuggestedActionDTO[];
  cards?: AssistantShowCardAction[];
  proposals?: AssistantProposeAction[];
  model: string;
  provider: string;
  requestId?: string;
  latencyMs?: number;
}

export interface ExecuteActionInputDTO {
  actionId: string;
  actionName: AssistantExecutableActionName | string;
  params: Record<string, unknown>;
  idempotencyKey: string;
}

export interface ExecuteActionResultDTO {
  success: boolean;
  actionName: string;
  message: string;
  data?: Record<string, unknown>;
  error?: string;
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
