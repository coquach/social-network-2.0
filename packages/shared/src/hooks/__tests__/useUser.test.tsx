/**
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  useCurrentUser,
  useUser,
  useUpdateProfile,
} from '../useUser';

// Mock contexts
vi.mock('../../contexts/auth-context', () => ({
  useAuth: vi.fn(() => ({ userId: 'user-1' })),
}));
vi.mock('../../contexts/upload-context', () => ({
  useUploadOptional: vi.fn(() => undefined),
}));

// Mock services directly
vi.mock('../../api/services/user.service', () => {
  return {
    userService: {
      getUser: vi.fn(),
      updateProfile: vi.fn(),
      searchUsers: vi.fn(),
    },
  };
});
vi.mock('../../api/services/friend.service', () => {
  return {
    friendService: {
      getFriends: vi.fn(),
    },
  };
});

import { userService } from '../../api/services/user.service';

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

describe('useUser hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useCurrentUser', () => {
    it('should fetch current user profile', async () => {
      const mockProfile = { id: 'user-1', firstName: 'John' };
      vi.mocked(userService.getUser).mockResolvedValue(mockProfile as any);

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockProfile);
      expect(userService.getUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('useUser', () => {
    it('should fetch specific user profile', async () => {
      const mockProfile = { id: 'user-2', firstName: 'Jane' };
      vi.mocked(userService.getUser).mockResolvedValue(mockProfile as any);

      const { result } = renderHook(() => useUser('user-2'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockProfile);
      expect(userService.getUser).toHaveBeenCalledWith('user-2');
    });
  });

  describe('useUpdateProfile', () => {
    it('should call updateProfile API', async () => {
      const updatedProfile = { id: 'user-1', firstName: 'Jane' };
      vi.mocked(userService.updateProfile).mockResolvedValue(updatedProfile as any);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ firstName: 'Jane' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(userService.updateProfile).toHaveBeenCalledWith({
        firstName: 'Jane',
      });
      expect(result.current.data).toEqual(updatedProfile);
    });
  });
});
