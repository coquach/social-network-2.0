/**
 * Chatbot Service
 * Platform-agnostic chatbot/assistant API operations
 */

import { getApiClient } from '../client';
import type {
  AssistantMessageInput,
  AssistantRespondDataDTO,
  ChatbotClearHistoryResultDTO,
  ChatbotHistoryPageDTO,
  ChatbotHistoryQuery,
  ChatbotHistoryMessageDTO,
} from '../../types';

type ChatbotHistoryMessageRaw = {
  id: string;
  conversation_id?: string;
  conversationId?: string;
  user_id?: string;
  userId?: string;
  role: string;
  content: string;
  intent?: string | null;
  sources?: ChatbotHistoryMessageDTO['sources'];
  metadata?: Record<string, unknown>;
  created_at?: string;
  createdAt?: string;
};

type ChatbotHistoryPageRaw = {
  items: ChatbotHistoryMessageRaw[];
  next_cursor_created_at?: string | null;
  nextCursorCreatedAt?: string | null;
  next_cursor_id?: string | null;
  nextCursorId?: string | null;
  has_more?: boolean;
  hasMore?: boolean;
};

type ChatbotClearHistoryResultRaw = {
  deleted_count?: number;
  deletedCount?: number;
  session_cleared?: boolean;
  sessionCleared?: boolean;
};

const HISTORY_CURSOR_SEPARATOR = '::';

const encodeHistoryCursor = (
  createdAt: string,
  id: string
): string => {
  return `${encodeURIComponent(createdAt)}${HISTORY_CURSOR_SEPARATOR}${encodeURIComponent(id)}`;
};

const decodeHistoryCursor = (
  cursor: string
): { beforeCreatedAt: string; beforeId: string } | null => {
  const [createdAt, id] = cursor.split(HISTORY_CURSOR_SEPARATOR);
  if (!createdAt || !id) {
    return null;
  }

  return {
    beforeCreatedAt: decodeURIComponent(createdAt),
    beforeId: decodeURIComponent(id),
  };
};

const normalizeHistoryMessage = (
  item: ChatbotHistoryMessageRaw
): ChatbotHistoryMessageDTO => ({
  id: item.id,
  conversationId: item.conversationId ?? item.conversation_id ?? '',
  userId: item.userId ?? item.user_id ?? '',
  role: item.role,
  content: item.content,
  intent: item.intent ?? null,
  sources: item.sources ?? [],
  metadata: item.metadata ?? {},
  createdAt: item.createdAt ?? item.created_at ?? '',
});

const normalizeHistoryPage = (
  payload: ChatbotHistoryPageRaw
): ChatbotHistoryPageDTO => ({
  data: (payload.items ?? []).map(normalizeHistoryMessage),
  nextCursor:
    (payload.nextCursorCreatedAt ?? payload.next_cursor_created_at) &&
    (payload.nextCursorId ?? payload.next_cursor_id)
      ? encodeHistoryCursor(
          payload.nextCursorCreatedAt ?? payload.next_cursor_created_at ?? '',
          payload.nextCursorId ?? payload.next_cursor_id ?? '',
        )
      : null,
  hasNextPage: payload.hasMore ?? payload.has_more ?? false,
});

const normalizeClearHistory = (
  payload: ChatbotClearHistoryResultRaw
): ChatbotClearHistoryResultDTO => ({
  deletedCount: payload.deletedCount ?? payload.deleted_count ?? 0,
  sessionCleared: payload.sessionCleared ?? payload.session_cleared ?? false,
});

export const chatbotService = {
  /**
   * Send a message to assistant/chatbot
   */
  async respond(data: AssistantMessageInput): Promise<AssistantRespondDataDTO> {
    return getApiClient().post<AssistantRespondDataDTO>('/assistant/messages', data);
  },

  /**
   * Get assistant chat history for a user
   */
  async getHistory(
    _userId: string,
    query?: ChatbotHistoryQuery
  ): Promise<ChatbotHistoryPageDTO> {
    const params: Record<string, string | number> = {};
    if (query?.limit) params.page_size = query.limit;

    if (query?.cursor) {
      const decodedCursor = decodeHistoryCursor(query.cursor);
      if (decodedCursor) {
        params.before_created_at = decodedCursor.beforeCreatedAt;
        params.before_id = decodedCursor.beforeId;
      }
    }

    const response = await getApiClient().get<ChatbotHistoryPageRaw>(
      `/assistant/chat-history/me`,
      { params },
    );

    return normalizeHistoryPage(response);
  },

  /**
   * Clear assistant chat history for a user
   */
  async clearHistory(_userId: string): Promise<ChatbotClearHistoryResultDTO> {
    const response = await getApiClient().delete<ChatbotClearHistoryResultRaw>(
      `/assistant/chat-history/me`,
    );

    return normalizeClearHistory(response);
  },
};
