import type { Metadata } from 'next';
import { getCachedRecommendedGroups } from '@/lib/cached-fetchers';
import { QueryErrorBoundary } from '@/components/query-error-boundary';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { ExploreList } from './explore-list';
import { queryKeys } from '@repo/shared';

export const metadata: Metadata = {
  title: 'Khám phá nhóm',
  description: 'Khám phá các cộng đồng mới trên Sentimeta.',
};

export default async function ExplorePage() {
  const { getToken } = await auth();

  const token = await getToken();
  if (!token) {
    redirect('/sign-in');
  }
  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: queryKeys.groups.recommended(),
    queryFn: async ({ pageParam }) => {
      return await getCachedRecommendedGroups(token, { limit: 10, cursor: pageParam as string | undefined });
    },
    initialPageParam: undefined as string | undefined,
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QueryErrorBoundary>
        <div className="p-2">
          <ExploreList />
        </div>
      </QueryErrorBoundary>
    </HydrationBoundary>
  );
}

