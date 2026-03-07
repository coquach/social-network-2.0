import type { Metadata } from 'next';
import { getMyGroups } from '@/lib/actions/group/group-action';
import { QueryErrorBoundary } from '@/components/query-error-boundary';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { MyGroupsList } from './my-groups-list';

export const metadata: Metadata = {
  title: 'Nhóm của tôi',
  description: 'Danh sách nhóm bạn đang tham gia.',
};

export default async function MyGroupsPage() {
  const { getToken } = await auth();

  const token = await getToken();
  if (!token) {
    redirect('/sign-in');
  }
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['my-groups'],
    queryFn: () => getMyGroups(token, { limit: 10 }),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QueryErrorBoundary>
        <div className="p-2">
          <MyGroupsList />
        </div>
      </QueryErrorBoundary>
    </HydrationBoundary>
  );
}
