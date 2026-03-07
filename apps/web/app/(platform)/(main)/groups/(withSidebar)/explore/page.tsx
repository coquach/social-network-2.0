import type { Metadata } from 'next';
import { getCachedRecommendedGroups } from '@/lib/cached-fetchers';
import { QueryErrorBoundary } from '@/components/query-error-boundary';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { ExploreList } from './explore-list';

export const metadata: Metadata = {
  title: 'Khám phá nhóm',
  description: 'Khám phá những nhóm phù hợp với bạn.',
};

export default async function GroupExplorePage() {
  const { getToken } = await auth();

  const token = await getToken();
  if (!token) {
    redirect('/sign-in');
  }
  const queryClient = getQueryClient();
  queryClient.prefetchQuery({
    queryKey: ['my-groups'],
    queryFn: async () => {
      return await getCachedRecommendedGroups(token, { limit: 10 });
    },
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
