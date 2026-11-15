// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMyFeed, useTrendingFeed, useTrackFeedViews } from '../useFeed';
import { FeedType } from '../../types';
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

const intervention = {
  id: 'int1',
  type: 'AI_CHATBOT_SAFE_SPACE' as const,
  title: 'Góc nhỏ lắng nghe',
  description: 'Bạn có muốn trò chuyện cùng Trợ lý AI không?',
  buttonText: 'Trò chuyện cùng Trợ lý AI',
};

const postSnapshot = {
  postId: 'post1',
  userId: 'u1',
  audience: 'PUBLIC',
  mainEmotion: 'JOY',
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

const shareSnapshot = {
  shareId: 'share1',
  userId: 'u2',
  audience: 'PUBLIC',
  post: postSnapshot,
  shareStat: {
    reactions: 0,
    likes: 0,
    loves: 0,
    hahas: 0,
    wows: 0,
    angrys: 0,
    sads: 0,
    comments: 0,
  },
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

// Feed page: POST, SHARE, INTERVENTION (at index 4), plus one malformed item
const polymorphicPage = {
  data: [
    { id: 'f1', type: 'POST', item: postSnapshot },
    { id: 'f2', type: 'SHARE', item: shareSnapshot },
    { id: 'f3', type: 'POST', item: { ...postSnapshot, postId: 'post2' } },
    { id: 'f4', type: 'SHARE', item: { ...shareSnapshot, shareId: 'share2' } },
    { id: 'f5', type: 'INTERVENTION', intervention },
    { id: 'f6', type: 'POST' }, // malformed: missing item payload
  ],
  nextCursor: null,
};

describe('useFeed hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe('useMyFeed', () => {
    it('should fetch personal feed', async () => {
      const mockResponse = {
        data: [{ id: '1', type: 'POST', item: postSnapshot }],
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

    it('should parse POST, SHARE and INTERVENTION items without crashing', async () => {
      vi.mocked(feedService.getMyFeed).mockResolvedValueOnce(
        polymorphicPage as any,
      );

      const { result } = renderHook(() => useMyFeed(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const items = result.current.data!;
      // Malformed item is skipped instead of crashing the whole feed
      expect(items).toHaveLength(5);

      expect(items[0].type).toBe(FeedType.POST);
      expect((items[0].data as any).postId).toBe('post1');
      expect(items[1].type).toBe(FeedType.SHARE);
      expect((items[1].data as any).shareId).toBe('share1');
      expect(items[4].type).toBe(FeedType.INTERVENTION);
      expect((items[4].data as any).title).toBe('Góc nhỏ lắng nghe');
      expect((items[4].data as any).buttonText).toBe(
        'Trò chuyện cùng Trợ lý AI',
      );
    });
  });

  describe('useTrendingFeed', () => {
    it('should fetch trending feed', async () => {
      const mockResponse = {
        data: [{ id: '1', type: 'POST', item: postSnapshot }],
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

    it('should parse polymorphic FeedItemDTO (POST, SHARE, INTERVENTION)', async () => {
      vi.mocked(feedService.getTrendingFeed).mockResolvedValueOnce(
        polymorphicPage as any,
      );

      const { result } = renderHook(() => useTrendingFeed(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const items = result.current.data!;
      expect(items).toHaveLength(5);
      expect(items.map((i) => i.type)).toEqual([
        FeedType.POST,
        FeedType.SHARE,
        FeedType.POST,
        FeedType.SHARE,
        FeedType.INTERVENTION,
      ]);
    });

    it('should keep mainEmotion: null intact', async () => {
      vi.mocked(feedService.getTrendingFeed).mockResolvedValueOnce({
        data: [
          {
            id: '1',
            type: 'POST',
            item: { ...postSnapshot, mainEmotion: null, secondaryEmotions: [] },
          },
        ],
        nextCursor: null,
      } as any);

      const { result } = renderHook(() => useTrendingFeed(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const post = result.current.data![0].data as any;
      expect(post.mainEmotion).toBeNull();
      expect(post.secondaryEmotions).toEqual([]);
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
