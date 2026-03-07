import type { Metadata } from 'next';
import { getCachedConversationById } from '@/lib/cached-fetchers';
import { QueryErrorBoundary } from '@/components/query-error-boundary';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { ConversationSection } from './conversation-section';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}): Promise<Metadata> {
  const { conversationId } = await params;
  return {
    title: 'Cuộc trò chuyện',
    description: 'Nội dung cuộc trò chuyện của bạn.',
  };
}

export default async function ConversationIdPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  const { getToken } = await auth();
  const token = await getToken();
  const queryClient = getQueryClient();

  await queryClient.fetchQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!token) throw new Error('Token is required');
      return await getCachedConversationById(token, conversationId);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QueryErrorBoundary>
        <ConversationSection conversationId={conversationId} />
      </QueryErrorBoundary>
    </HydrationBoundary>
  );
}
