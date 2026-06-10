'use client';
import { useConversationNav } from '@/hooks/use-conversation-nav';
import { EmptyState } from './_components/empty-state';
import clsx from 'clsx';

export const Conversations = () => {
  const { isOpen } = useConversationNav();
  return (
    <div
      className={clsx(
        ' lg:block lg:pl-100 h-full',
        isOpen ? 'block' : 'hidden'
      )}
    >
      <EmptyState />
    </div>
  );
};
