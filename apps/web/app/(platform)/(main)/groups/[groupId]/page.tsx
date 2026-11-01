import { getCachedPostsByGroup } from '@/lib/cached-fetchers';
import { QueryErrorBoundary } from '@/components/query-error-boundary';
import { getQueryClient } from '@/lib/query-client';
import { PostGroupStatus } from '@repo/shared';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary, infiniteQueryOptions } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { GroupCreatePost } from './_components/group-create-post';
import { GroupPostList } from './_components/group-post-list';

export default async function GroupIdPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const { getToken } = await auth();

  const token = await getToken();
  if (!token) {
    redirect('/sign-in');
  }
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    infiniteQueryOptions({
      queryKey: ['posts', 'group', groupId, PostGroupStatus.PUBLISHED],
      queryFn: async ({ pageParam }) => {
        return await getCachedPostsByGroup(groupId, {
          limit: 10,
          status: PostGroupStatus.PUBLISHED,
          cursor: pageParam as string | undefined,
        });
      },
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage: any) =>
        lastPage?.hasNextPage ? (lastPage.nextCursor ?? undefined) : undefined,
    })
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QueryErrorBoundary>
        <div className="max-w-6xl  flex flex-col gap-6">
          <GroupCreatePost
            placeholder="Viết gì đó cho nhóm..."
            groupId={groupId}
          />
          <GroupPostList groupId={groupId} />
        </div>
      </QueryErrorBoundary>
    </HydrationBoundary>
  );
}
