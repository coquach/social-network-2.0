/**
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useUserActivity } from '../useUserActivity';

// Mock service directly
vi.mock('../../api/services/user-activity.service', () => {
  return {
    userActivityService: {
      getUserActivityLogs: vi.fn(),
    },
  };
});

import { userActivityService } from '../../api/services/user-activity.service';

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

describe('useUserActivity hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useUserActivity', () => {
    it('should fetch user activity logs', async () => {
      const mockResponse = {
        data: [{ id: '1', action: 'LOGIN' }],
        nextCursor: null,
        totalCount: 1,
      };

      vi.mocked(userActivityService.getUserActivityLogs).mockResolvedValue(
        mockResponse as any,
      );

      const { result } = renderHook(() => useUserActivity(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pages[0]).toEqual(mockResponse);
      expect(userActivityService.getUserActivityLogs).toHaveBeenCalledTimes(1);
    });
  });
});
