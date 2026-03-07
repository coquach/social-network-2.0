import { redirect } from 'next/navigation';

import { getEmotionDetail } from '@/lib/actions/emotion/emotion-action';
import { getQueryClient } from '@/lib/query-client';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { EmotionDetailClient } from './page-client';

type EmotionDetailPageProps = {
  params: Promise<{ emotionId: string }>;
};

export default async function EmotionDetailPage({
  params,
}: EmotionDetailPageProps) {
  const { emotionId } = await params;
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    redirect('/sign-in');
  }

  try {
    const queryClient = getQueryClient();
    await queryClient.prefetchQuery({
      queryKey: ['emotion-detail', emotionId],
      queryFn: () => getEmotionDetail(token, emotionId),
    });

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <EmotionDetailClient emotionId={emotionId} />
      </HydrationBoundary>
    );
  } catch {
    return <EmotionDetailClient emotionId={emotionId} hasError />;
  }
}
