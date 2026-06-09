'use client';

import { usePost } from '@repo/shared';
import { RootType } from '@/models/social/enums/social.enum';
import { DetailView } from '@/components/post/detail-view';

export default function PostDetailViewWrapper({ postId }: { postId: string }) {
  const { data: post, isLoading, isError } = usePost(postId);

  return (
    <DetailView 
      type={RootType.POST} 
      post={post} 
      isLoading={isLoading} 
      isError={isError} 
    />
  );
}
