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
   * Stream response from assistant/chatbot
   */
  async *streamRespond(data: AssistantMessageInput): AsyncGenerator<AssistantRespondDataDTO> {
    const client = getApiClient();
    const axiosInstance = client.getAxiosInstance();
    const baseURL = axiosInstance.defaults.baseURL;
    
    const token = await client.getToken();
    
    // Construct URL with query params for SSE GET request (matching API Gateway @Sse)
    const url = new URL(`${baseURL}/assistant/messages-stream`);
    url.searchParams.append('message', data.message);
    if (data.clientMessageId) {
      url.searchParams.append('clientMessageId', data.clientMessageId);
    }

    // React Native Fallback: Use XMLHttpRequest since fetch() doesn't support ReadableStream
    if (
      typeof ReadableStream === 'undefined' ||
      (typeof navigator !== 'undefined' && (navigator as any).product === 'ReactNative')
    ) {
      const XHR = (globalThis as any).XMLHttpRequest;
      const xhr = new XHR();
      xhr.open('GET', url.toString(), true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Accept', 'text/event-stream');

      let lastIndex = 0;
      let buffer = '';
      
      const queue: string[] = [];
      let resolveNext: (() => void) | null = null;
      let isDone = false;
      let streamError: any = null;

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 3 || xhr.readyState === 4) {
          const currentText = xhr.responseText || '';
          const newText = currentText.substring(lastIndex);
          lastIndex = currentText.length;
          
          if (newText) {
            buffer += newText;
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.replace('data: ', '').trim();
                if (jsonStr) {
                  queue.push(jsonStr);
                  if (resolveNext) {
                    resolveNext();
                    resolveNext = null;
                  }
                }
              }
            }
          }
          
          if (xhr.readyState === 4) {
            isDone = true;
            if (xhr.status !== 200) {
              streamError = new Error(`Chat stream failed: ${xhr.status}`);
            }
            if (resolveNext) {
              resolveNext();
              resolveNext = null;
            }
          }
        }
      };
      
      xhr.onerror = () => {
        streamError = new Error('Network error during stream');
        isDone = true;
        if (resolveNext) {
          resolveNext();
          resolveNext = null;
        }
      };

      xhr.send();

      try {
        while (true) {
          if (queue.length > 0) {
            const jsonStr = queue.shift()!;
            try {
              const chunk = JSON.parse(jsonStr);
              yield chunk;
            } catch (e) {
              console.error('[chatbotService] Failed to parse SSE chunk:', e);
            }
          } else if (isDone) {
            if (streamError) throw streamError;
            break;
          } else {
            await new Promise<void>(resolve => { resolveNext = resolve; });
          }
        }
      } finally {
        xhr.abort();
      }
      return;
    }

    // Web Environment (Native fetch + ReadableStream)
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/event-stream',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Chat stream failed: ${response.status} ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('ReadableStream not supported by this platform');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last partial line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.replace('data: ', '').trim();
            if (jsonStr) {
              try {
                const chunk = JSON.parse(jsonStr);
                yield chunk;
              } catch (e) {
                console.error('[chatbotService] Failed to parse SSE chunk:', e);
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
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
