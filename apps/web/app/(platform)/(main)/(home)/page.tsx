import type { Metadata } from 'next';

import { QueryErrorBoundary } from '../../../../components/query-error-boundary';
import { HomeFeed } from './home-feed';
import { ChannelComposer } from '@/components/create-post/channel-composer';

export const metadata: Metadata = {
  title: 'Trang chủ',
  description: 'Bảng tin của bạn trên Sentimeta.',
};

const NewsFeedPage = () => {
  return (
    <QueryErrorBoundary>
      <div className="h-full w-full p-4 space-y-6">
        <ChannelComposer />
        <HomeFeed />
      </div>
    </QueryErrorBoundary>
  );
};
export default NewsFeedPage;
