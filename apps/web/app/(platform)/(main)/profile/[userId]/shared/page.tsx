import { UserSharePosts } from '../_components/share-post';

export default async function ProfileSharedPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return <UserSharePosts userId={userId as string} />;
}
