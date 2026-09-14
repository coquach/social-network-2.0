/**
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  useMessages,
  useSendMessage,
  useUpdateMessage,
  useDeleteMessage,
  useMarkMessageAsRead,
  useReactToMessage,
  useSendTypingIndicator,
} from '../useMessage';

// Mock contexts
vi.mock('../../contexts/auth-context', () => ({
  useAuth: vi.fn(() => ({ userId: 'user-1' })),
}));
vi.mock('../../contexts/upload-context', () => ({
  useUploadOptional: vi.fn(() => undefined),
}));

// Mock services directly
vi.mock('../../api/services/message.service', () => {
  return {
    messageService: {
      getMessages: vi.fn(),
      sendMessage: vi.fn(),
      updateMessage: vi.fn(),
      deleteMessage: vi.fn(),
      markAsRead: vi.fn(),
      reactToMessage: vi.fn(),
      sendTypingIndicator: vi.fn(),
    },
  };
});

import { messageService } from '../../api/services/message.service';
import { ReactionType } from '../../types/enums';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

export function createWrapper() {
  const testQueryClient = createTestQueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useMessage hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useMessages', () => {
    it('should fetch messages for a conversation', async () => {
      const mockResponse = {
        data: [{ _id: 'msg-1', content: 'Hello' }],
        nextCursor: null,
        totalCount: 1,
      };

      vi.mocked(messageService.getMessages).mockResolvedValue(
        mockResponse as any,
      );

      const { result } = renderHook(() => useMessages('conv-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pages[0]).toEqual(mockResponse);
      expect(messageService.getMessages).toHaveBeenCalledWith('conv-1', {
        cursor: undefined,
      });
    });
  });

  describe('useSendMessage', () => {
    it('should call sendMessage API', async () => {
      const sentMessage = { _id: 'msg-2', conversationId: 'conv-1', content: 'Hi' };
      vi.mocked(messageService.sendMessage).mockResolvedValue(sentMessage as any);

      const { result } = renderHook(() => useSendMessage('conv-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ conversationId: 'conv-1', content: 'Hi' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(messageService.sendMessage).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        content: 'Hi',
        attachments: undefined,
      });
    });
  });

  describe('useUpdateMessage', () => {
    it('should call updateMessage API', async () => {
      const updatedMessage = { _id: 'msg-1', content: 'Updated' };
      vi.mocked(messageService.updateMessage).mockResolvedValue(
        updatedMessage as any,
      );

      const { result } = renderHook(() => useUpdateMessage('conv-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ messageId: 'msg-1', content: 'Updated' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(messageService.updateMessage).toHaveBeenCalledWith('msg-1', {
        content: 'Updated',
      });
    });
  });

  describe('useDeleteMessage', () => {
    it('should call deleteMessage API', async () => {
      vi.mocked(messageService.deleteMessage).mockResolvedValue(undefined as any);

      const { result } = renderHook(() => useDeleteMessage('conv-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate('msg-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(messageService.deleteMessage).toHaveBeenCalledWith('msg-1');
    });
  });

  describe('useMarkMessageAsRead', () => {
    it('should call markAsRead API', async () => {
      vi.mocked(messageService.markAsRead).mockResolvedValue(undefined as any);

      const { result } = renderHook(() => useMarkMessageAsRead(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ conversationId: 'conv-1', messageId: 'msg-1' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(messageService.markAsRead).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        messageId: 'msg-1',
      });
    });
  });

  describe('useReactToMessage', () => {
    it('should call reactToMessage API', async () => {
      vi.mocked(messageService.reactToMessage).mockResolvedValue(undefined as any);

      const { result } = renderHook(() => useReactToMessage('conv-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ messageId: 'msg-1', reactionType: ReactionType.LIKE });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(messageService.reactToMessage).toHaveBeenCalledWith('msg-1', ReactionType.LIKE);
    });
  });

  describe('useSendTypingIndicator', () => {
    it('should call sendTypingIndicator API', async () => {
      vi.mocked(messageService.sendTypingIndicator).mockResolvedValue(undefined as any);

      const { result } = renderHook(() => useSendTypingIndicator(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ conversationId: 'conv-1', isTyping: true });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(messageService.sendTypingIndicator).toHaveBeenCalledWith('conv-1', true);
    });
  });
});
