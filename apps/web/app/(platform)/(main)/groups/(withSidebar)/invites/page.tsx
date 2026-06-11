import type { Metadata } from 'next';
import { getInvitedGroups } from '@/lib/actions/group/group-action';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { InvitedGroupsList } from './invited-groups-list';
import { queryKeys } from '@repo/shared';

export const metadata: Metadata = {
  title: 'Lời mời nhóm',
  description: 'Lời mời tham gia nhóm dành cho bạn.',
};

export default async function InvitedGroupsPage() {
  const { getToken } = await auth();

  const token = await getToken();
  if (!token) {
    redirect('/sign-in');
  }
  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: queryKeys.groups.invited(),
    queryFn: ({ pageParam }) => getInvitedGroups(token, { limit: 10, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-2">
        <InvitedGroupsList />
      </div>
    </HydrationBoundary>
  );
}
