'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useCreatePostContext } from './context';
import { CreatePostComponentProps } from './types';

/**
 * Frame - Container component for CreatePost
 * Provides the Card wrapper with consistent styling
 */
export const CreatePostFrame = ({ className, children }: CreatePostComponentProps) => {
  const { handleSubmit } = useCreatePostContext();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit();
      }}
      className={cn('w-full', className)}
    >
      <Card className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4">
        {children}
      </Card>
    </form>
  );
};
