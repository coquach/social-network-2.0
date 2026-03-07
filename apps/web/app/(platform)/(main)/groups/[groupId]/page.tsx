import { getCachedPostsByGroup } from '@/lib/cached-fetchers';
import { QueryErrorBoundary } from '@/components/query-error-boundary';
import { getQueryClient } from '@/lib/query-client';
import { PostGroupStatus } from '@/models/social/enums/social.enum';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
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

  await queryClient.prefetchQuery({
    queryKey: ['posts', 'group', groupId],
    queryFn: async () => {
      return await getCachedPostsByGroup(token, groupId, {
        limit: 10,
        status: PostGroupStatus.PUBLISHED,
      });
    },
  });
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
