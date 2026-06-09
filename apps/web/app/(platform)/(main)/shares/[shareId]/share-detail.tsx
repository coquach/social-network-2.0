'use client';

import { useShare } from '@repo/shared';
import { RootType } from '@/models/social/enums/social.enum';
import { DetailView } from '@/components/post/detail-view';

export default function ShareDetailViewWrapper({ shareId }: { shareId: string }) {
  const { data: share, isLoading, isError } = useShare(shareId);

  return (
    <DetailView 
      type={RootType.SHARE} 
      share={share} 
      isLoading={isLoading} 
      isError={isError} 
    />
  );
}
