// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useReactToPost, useRemoveReaction } from '../usePost'; // Reaction hooks are inside usePost.ts
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { postService } from '../../api/services/post.service';
import { ReactionType } from '../../types/enums';

vi.mock('../../api/services/post.service', () => ({
  postService: {
    reactToPost: vi.fn(),
    removeReaction: vi.fn(),
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

describe('Reaction hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe('useReactToPost', () => {
    it('should react to post', async () => {
      vi.mocked(postService.reactToPost).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useReactToPost(), { wrapper });

      result.current.mutate({ postId: '1', reactionType: ReactionType.LIKE });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(postService.reactToPost).toHaveBeenCalledWith({
        targetId: '1',
        targetType: 'POST',
        reactionType: ReactionType.LIKE,
      });
    });
  });

  describe('useRemoveReaction', () => {
    it('should remove reaction', async () => {
      vi.mocked(postService.removeReaction).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useRemoveReaction(), { wrapper });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(postService.removeReaction).toHaveBeenCalledWith({
        targetId: '1',
        targetType: 'POST',
      });
    });
  });
});
