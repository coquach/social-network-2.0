'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

import { ContentEntryFilter, getContentEntry } from '@/lib/actions/admin/content-entry-action';
import { PageResponse } from '@/lib/pagination.dto';
import { ContentEntryDTO } from '@/models/social/post/contentEntryDTO';

export const useContentEntries = (filter: ContentEntryFilter) => {
  const { getToken } = useAuth();

  return useQuery<PageResponse<ContentEntryDTO>>({
    queryKey: ['admin-content-entries', filter],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return getContentEntry(token, filter);
    },
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    gcTime: 120_000,
  });
};
