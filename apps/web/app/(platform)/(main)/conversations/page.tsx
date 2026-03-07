import type { Metadata } from 'next';
import { QueryErrorBoundary } from '@/components/query-error-boundary';
import { Conversations } from './conversations';

export const metadata: Metadata = {
  title: 'Tin nhắn',
  description: 'Danh sách cuộc trò chuyện của bạn.',
};

export default function ConversationPage() {
  return (
    <QueryErrorBoundary>
      <Conversations />
    </QueryErrorBoundary>
  );
}
