import type { Metadata } from 'next';
import { getCachedPost } from '@/lib/cached-fetchers';
import { QueryErrorBoundary } from '@/components/query-error-boundary';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import PostDetailView from './post-detail';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>;
}): Promise<Metadata> {
  await params; // Await params to satisfy Next.js type requirements
  return {
    title: 'Bài viết',
    description: 'Chi tiết bài viết trên Sentimeta.',
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) {
    return null;
  }
  const qc = getQueryClient();

  qc.prefetchQuery({
    queryKey: ['post', postId],
    queryFn: async () => getCachedPost(token, postId),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <QueryErrorBoundary>
        <PostDetailView postId={postId} />
      </QueryErrorBoundary>
    </HydrationBoundary>
  );
}
