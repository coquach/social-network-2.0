/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useUser, useUpdateProfile } from '../useUser';
import { userService } from '../../api/services/user.service';

vi.mock('../../api/services/user.service', () => ({
  userService: {
    getUser: vi.fn(),
    updateProfile: vi.fn(),
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

describe('useUser hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useUser', () => {
    it('fetches a user by id', async () => {
      const mockUser = { id: 'user_1', firstName: 'John', lastName: 'Doe' };
      vi.mocked(userService.getUser).mockResolvedValueOnce(mockUser as any);

      const { result } = renderHook(() => useUser('user_1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUser);
      expect(userService.getUser).toHaveBeenCalledWith('user_1');
    });
  });

  describe('useUpdateProfile', () => {
    it('updates user profile', async () => {
      const mockUser = { id: 'user_1', firstName: 'Jane' };
      vi.mocked(userService.updateProfile).mockResolvedValueOnce(mockUser as any);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        firstName: 'Jane',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(userService.updateProfile).toHaveBeenCalledWith({
        firstName: 'Jane',
      });
    });
  });
});
