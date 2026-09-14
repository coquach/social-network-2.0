/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { usePost, useCreatePost } from '../usePost';
import { postService } from '../../api/services/post.service';
import { Audience } from '../../types/enums';

vi.mock('../../api/services/post.service', () => ({
  postService: {
    getPost: vi.fn(),
    createPost: vi.fn(),
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

describe('usePost hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches a post by id', async () => {
    const mockPost = { id: '1', content: 'Hello World' };
    vi.mocked(postService.getPost).mockResolvedValueOnce(mockPost as any);

    const { result } = renderHook(() => usePost('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockPost);
    expect(postService.getPost).toHaveBeenCalledWith('1');
  });

  it('creates a post', async () => {
    const mockCreatedPost = { id: 'new-id', content: 'New Post' };
    vi.mocked(postService.createPost).mockResolvedValueOnce(mockCreatedPost as any);

    const { result } = renderHook(() => useCreatePost(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      content: 'New Post',
      audience: Audience.PUBLIC,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(postService.createPost).toHaveBeenCalledWith({
      content: 'New Post',
      audience: Audience.PUBLIC,
    });
  });
});
