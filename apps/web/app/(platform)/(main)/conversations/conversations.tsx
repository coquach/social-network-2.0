'use client';
import { useConversationId } from '@/hooks/use-conversation-id';
import { EmptyState } from './_components/empty-state';
import clsx from 'clsx';

export const Conversations = () => {
  const { isOpen } = useConversationId();
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
