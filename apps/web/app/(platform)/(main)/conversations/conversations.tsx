'use client';
import { useConversation } from '@/hooks/use-conversation';
import { EmptyState } from './_components/empty-state';
import clsx from 'clsx';

export const Conversations = () => {
  const { isOpen } = useConversation();
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
