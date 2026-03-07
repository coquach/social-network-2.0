import type { Metadata } from 'next';
import { getInvitedGroups } from '@/lib/actions/group/group-action';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { InvitedGroupsList } from './invited-groups-list';

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
  await queryClient.prefetchQuery({
    queryKey: ['get-invited-groups', { limit: 10 }],
    queryFn: () => getInvitedGroups(token, { limit: 10 }),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-2">
        <InvitedGroupsList />
      </div>
    </HydrationBoundary>
  );
}
