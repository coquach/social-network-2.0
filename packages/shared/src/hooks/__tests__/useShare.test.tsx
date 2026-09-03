// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSharePost } from '../useShare';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { shareService } from '../../api/services/share.service';
import { Audience } from '../../types/enums';

vi.mock('../../api/services/share.service', () => ({
  shareService: {
    sharePost: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('Share hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe('useSharePost', () => {
    it('should create a share', async () => {
      const mockResponse = { id: 'share-1', postId: 'post-1' };
      vi.mocked(shareService.sharePost).mockResolvedValueOnce(mockResponse as any);

      const { result } = renderHook(() => useSharePost(), { wrapper });

      result.current.mutate({
        postId: 'post-1',
        content: 'Check this out',
        audience: Audience.PUBLIC,
      });

      await waitFor(() => {
        if (result.current.isError) console.error(result.current.error);
        expect(result.current.isSuccess).toBe(true);
      });

      expect(shareService.sharePost).toHaveBeenCalledWith({
        postId: 'post-1',
        content: 'Check this out',
        audience: Audience.PUBLIC,
      });
      expect(result.current.data).toEqual(mockResponse);
    });
  });
});
