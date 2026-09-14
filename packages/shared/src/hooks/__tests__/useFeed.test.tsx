// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMyFeed, useTrendingFeed, useTrackFeedViews } from '../useFeed';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { feedService } from '../../api/services';

vi.mock('../../api/services', () => ({
  feedService: {
    getMyFeed: vi.fn(),
    getTrendingFeed: vi.fn(),
    trackViews: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useFeed hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe('useMyFeed', () => {
    it('should fetch personal feed', async () => {
      const mockResponse = {
        data: [{ id: '1', type: 'POST', item: { id: 'post1' } }],
        nextCursor: null,
      };

      vi.mocked(feedService.getMyFeed).mockResolvedValueOnce(mockResponse as any);

      const { result } = renderHook(() => useMyFeed(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(feedService.getMyFeed).toHaveBeenCalledWith({ cursor: undefined });
      expect(result.current.data?.length).toBe(1);
    });
  });

  describe('useTrendingFeed', () => {
    it('should fetch trending feed', async () => {
      const mockResponse = {
        data: [{ id: 'post1' }],
        nextCursor: null,
      };

      vi.mocked(feedService.getTrendingFeed).mockResolvedValueOnce(mockResponse as any);

      const { result } = renderHook(() => useTrendingFeed(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(feedService.getTrendingFeed).toHaveBeenCalledWith({ cursor: undefined });
      expect(result.current.data?.length).toBe(1);
    });
  });

  describe('useTrackFeedViews', () => {
    it('should track feed views', async () => {
      vi.mocked(feedService.trackViews).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useTrackFeedViews(), { wrapper });

      result.current.mutate(['1', '2']);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(feedService.trackViews).toHaveBeenCalledWith(['1', '2']);
    });
  });
});
