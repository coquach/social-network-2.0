/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useGroup, useMyGroups, useCreateGroup } from '../useGroup';
import { groupService } from '../../api/services';
import { GroupPrivacy } from '../../types/enums';

vi.mock('../../api/services', () => ({
  groupService: {
    getGroupById: vi.fn(),
    getMyGroups: vi.fn(),
    createGroup: vi.fn(),
  },
}));

// Mock the useUploadOptional hook
vi.mock('../contexts/upload-context', () => ({
  useUploadOptional: vi.fn(() => ({
    uploadFile: vi.fn(),
  })),
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

describe('useGroup hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGroup', () => {
    it('fetches a group by id', async () => {
      const mockGroup = { id: 'group_1', name: 'React Devs' };
      vi.mocked(groupService.getGroupById).mockResolvedValueOnce(mockGroup as any);

      const { result } = renderHook(() => useGroup('group_1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockGroup);
      expect(groupService.getGroupById).toHaveBeenCalledWith('group_1');
    });
  });

  describe('useMyGroups', () => {
    it('fetches my groups with infinite scroll', async () => {
      const mockResponse = {
        data: [{ id: 'group_1', name: 'React Devs' }],
        nextCursor: null,
        hasNextPage: false,
      };
      vi.mocked(groupService.getMyGroups).mockResolvedValueOnce(mockResponse as any);

      const { result } = renderHook(() => useMyGroups(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.pages[0]).toEqual(mockResponse);
      expect(groupService.getMyGroups).toHaveBeenCalledWith({ cursor: undefined });
    });
  });

  describe('useCreateGroup', () => {
    it('creates a group and updates cache', async () => {
      const mockNewGroup = { id: 'group_2', name: 'New Group' };
      vi.mocked(groupService.createGroup).mockResolvedValueOnce(mockNewGroup as any);

      const { result } = renderHook(() => useCreateGroup(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: 'New Group',
        privacy: GroupPrivacy.PUBLIC,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(groupService.createGroup).toHaveBeenCalled();
    });
  });
});
