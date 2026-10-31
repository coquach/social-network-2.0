/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useComments } from '../useComment';
import { commentService } from '../../api/services/comment.service';
import { RootType } from '../../types/enums';

vi.mock('../../api/services/comment.service', () => ({
  commentService: {
    getComments: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useComments hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches comments when enabled is default/true', async () => {
    const mockResponse = {
      data: [{ id: 'c1', content: 'Test comment' }],
      page: 1,
      totalPages: 1,
      totalCount: 1,
    };
    vi.mocked(commentService.getComments).mockResolvedValueOnce(mockResponse as any);

    const { result } = renderHook(
      () =>
        useComments({
          rootId: 'post-1',
          rootType: RootType.POST,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(commentService.getComments).toHaveBeenCalledTimes(1);
  });

  it('does not fetch comments when enabled is false', async () => {
    const { result } = renderHook(
      () =>
        useComments(
          {
            rootId: 'post-1',
            rootType: RootType.POST,
          },
          { enabled: false }
        ),
      { wrapper: createWrapper() }
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(commentService.getComments).not.toHaveBeenCalled();
  });
});
