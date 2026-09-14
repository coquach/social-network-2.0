/**
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  useConversations,
  useConversation,
  useCreateConversation,
  useUpdateConversation,
  useDeleteConversation,
} from '../useConversation';

// Mock contexts
vi.mock('../../contexts/upload-context', () => ({
  useUploadOptional: vi.fn(() => undefined),
}));

// Mock services directly
vi.mock('../../api/services', () => {
  return {
    conversationService: {
      getConversations: vi.fn(),
      getConversation: vi.fn(),
      createConversation: vi.fn(),
      updateConversation: vi.fn(),
      deleteConversation: vi.fn(),
    },
  };
});

import { conversationService } from '../../api/services';

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

describe('useConversation hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useConversations', () => {
    it('should fetch conversations list', async () => {
      const mockResponse = {
        data: [{ _id: 'conv-1', name: 'Chat 1' }],
        nextCursor: null,
        totalCount: 1,
      };

      vi.mocked(conversationService.getConversations).mockResolvedValue(
        mockResponse as any,
      );

      const { result } = renderHook(() => useConversations(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pages[0]).toEqual(mockResponse);
      expect(conversationService.getConversations).toHaveBeenCalledTimes(1);
    });
  });

  describe('useConversation', () => {
    it('should fetch specific conversation', async () => {
      const mockResponse = { _id: 'conv-1', name: 'Chat 1' };
      vi.mocked(conversationService.getConversation).mockResolvedValue(
        mockResponse as any,
      );

      const { result } = renderHook(() => useConversation('conv-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(conversationService.getConversation).toHaveBeenCalledWith('conv-1');
    });
  });

  describe('useCreateConversation', () => {
    it('should call createConversation API', async () => {
      const newConversation = { _id: 'conv-2', name: 'New Chat' };
      vi.mocked(conversationService.createConversation).mockResolvedValue(
        newConversation as any,
      );

      const { result } = renderHook(() => useCreateConversation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ isGroup: false, participants: ['user-2'] } as any);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(conversationService.createConversation).toHaveBeenCalledWith({
        isGroup: false,
        participants: ['user-2'],
      });
      expect(result.current.data).toEqual(newConversation);
    });
  });

  describe('useUpdateConversation', () => {
    it('should call updateConversation API', async () => {
      const updatedConversation = { _id: 'conv-1', name: 'Updated Chat' };
      vi.mocked(conversationService.updateConversation).mockResolvedValue(
        updatedConversation as any,
      );

      const { result } = renderHook(() => useUpdateConversation('conv-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ groupName: 'Updated Chat' } as any);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(conversationService.updateConversation).toHaveBeenCalledWith('conv-1', {
        groupName: 'Updated Chat',
      });
    });
  });

  describe('useDeleteConversation', () => {
    it('should call deleteConversation API', async () => {
      vi.mocked(conversationService.deleteConversation).mockResolvedValue(undefined as any);

      const { result } = renderHook(() => useDeleteConversation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('conv-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(conversationService.deleteConversation).toHaveBeenCalledWith('conv-1');
    });
  });
});
