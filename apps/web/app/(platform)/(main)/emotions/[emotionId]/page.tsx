import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';

import { TargetType } from '@repo/shared';

import { EmotionDetailClient } from './page-client';

type EmotionDetailPageProps = {
  params: Promise<{ emotionId: string }>;
  searchParams: Promise<{ targetType?: string }>;
};

export default async function EmotionDetailPage({
  params,
  searchParams,
}: EmotionDetailPageProps) {
  const { emotionId } = await params;
  const { targetType } = await searchParams;

  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    redirect('/sign-in');
  }

  const VALID_TARGET_TYPES = ['POST', 'COMMENT', 'SHARE'] as const;

  if (!targetType || !VALID_TARGET_TYPES.includes(targetType as TargetType)) {
    notFound();
  }

  return (
    <EmotionDetailClient
      targetId={emotionId}
      targetType={targetType as TargetType}
    />
  );
}
