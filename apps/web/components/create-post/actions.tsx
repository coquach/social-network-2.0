'use client';

import { Button } from '@/components/ui/button';
import { EmojiButton } from '@/components/emoji-button';
import { cn } from '@/lib/utils';
import { useCreatePostContext } from './context';
import { CreatePostComponentProps } from './types';

/**
 * Actions - Action bar with emoji picker and submit button
 */
export const CreatePostActions = ({ className }: Omit<CreatePostComponentProps, 'children'>) => {
  const { form, isPending } = useCreatePostContext();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Emoji Picker */}
      <EmojiButton
        disabled={isPending}
        popupSide="bottom"
        align="center"
        onPick={(emoji) => {
          const current = form.state.values.content ?? '';
          form.setFieldValue('content', current + emoji);

          // Focus textarea
          const el = document.getElementById('content') as HTMLTextAreaElement | null;
          el?.focus();
        }}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending}
        className={cn(
          'disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:bg-gray-200'
        )}
      >
        Đăng
      </Button>
    </div>
  );
};
