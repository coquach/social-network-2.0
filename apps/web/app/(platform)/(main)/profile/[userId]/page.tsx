import type { Metadata } from 'next';
import { QueryErrorBoundary } from '@/components/query-error-boundary';
import { UserPosts } from './_components/user-posts';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  return {
    title: 'Trang cá nhân',
    description: 'Trang cá nhân trên Sentimeta.',
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return (
    <QueryErrorBoundary>
      <UserPosts userId={userId as string} />
    </QueryErrorBoundary>
  );
}
