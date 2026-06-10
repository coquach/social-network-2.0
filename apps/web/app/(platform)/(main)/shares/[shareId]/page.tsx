import type { Metadata } from 'next';
import { QueryErrorBoundary } from '@/components/query-error-boundary';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import ShareDetailViewWrapper from './share-detail';
import { getCachedShare } from '@/lib/cached-fetchers';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareId: string }>;
}): Promise<Metadata> {
  await params;
  return {
    title: 'Bài chia sẻ',
    description: 'Chi tiết bài chia sẻ trên Sentimeta.',
  };
}

export default async function ShareDetailPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) {
    return null;
  }
  const qc = getQueryClient();

  qc.prefetchQuery({
    queryKey: ['share', shareId],
    queryFn: async () => getCachedShare(token, shareId),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <QueryErrorBoundary>
        <ShareDetailViewWrapper shareId={shareId} />
      </QueryErrorBoundary>
    </HydrationBoundary>
  );
}
