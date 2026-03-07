'use client';

import { useSharePost } from '@/hooks/use-share-hook';
import { Audience } from '@/models/social/enums/social.enum';
import {
  SharePostSchema
} from '@/models/social/post/sharePostDTO';
import { useCreateShareModal } from '@/store/use-post-modal';
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { useForm } from '@tanstack/react-form';

import { cn } from '@/lib/utils';
import { AudienceSelect } from '../audience-select';
import { LargeAvatar } from '../avatar';
import SharedPostPreview from '../post/share-post-review';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';

import { countChars } from '@/utils/count-chars';
import { EmojiButton } from '../emoji-button';
import { LiveRegion } from '@/components/ui/live-region';

const MAX_WORDS = 200;

export const CreateShareModal = () => {
  const { userId } = useAuth();
  const { isOpen, closeModal, data } = useCreateShareModal();

  const postId = data?.postId || '';
  const { mutateAsync, isPending } = useSharePost(postId);

  const form = useForm({
    defaultValues: {
      content: '',
      audience: Audience.PUBLIC,
      postId,
    }  ,
    onSubmit: async ({ value }) => {
      // validate toàn form bằng zod
      const parsed = SharePostSchema.safeParse(value);
      if (!parsed.success) {
        toast.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
        return;
      }
      if (!parsed.data.postId) return;

      const promise = mutateAsync(parsed.data, {
        onSuccess: () => {
          form.reset();
          closeModal();
        },
      });

      toast.promise(promise, { loading: 'Đang chia sẻ...' });
    },
  });

  // reset khi mở modal / đổi post
  useEffect(() => {
    if (!data) return;
    form.reset({
      content: '',
      audience: Audience.PUBLIC,
      postId: data.postId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.postId]);

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <LiveRegion 
        message={isPending ? 'Đang chia sẻ bài viết...' : ''} 
        politeness="polite"
      />
      <DialogContent
        className={cn(
          'sm:max-w-xl p-0 overflow-hidden',
          'h-[80vh] max-h-[80vh] flex flex-col'
        )}
      >
        {/* Header cố định */}
        <DialogHeader className="shrink-0 border-b border-sky-100 bg-white/95 px-4 py-3">
          <DialogTitle className="text-lg font-semibold text-center">
            Chia sẻ bài viết
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col flex-1 min-h-0"
        >
          {/* Body scroll (tất cả nằm trong scroll, footer vẫn cố định) */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 space-y-4">
              {/* Row avatar + input */}
              <div className="flex items-start gap-3">
                <LargeAvatar userId={userId as string} hasBorder />

                <div className="flex-1 min-w-0 space-y-2">
                  {/* Audience */}
                  <form.Field name="audience">
                    {(field) => (
                      <AudienceSelect
                        value={field.state.value}
                        onChange={(value) => field.handleChange(value)}
                      />
                    )}
                  </form.Field>

                  {/* Textarea + counter */}
                  <form.Field
                    name="content"
                    validators={{
                      onChange: ({ value }) => {
                        const cc = countChars(value ?? '');
                        if (cc > MAX_WORDS) return `Tối đa ${MAX_WORDS} ký tự.`;
                        return undefined;
                      },
                    }}
                  >
                    {(field) => {
                      const value = field.state.value ?? '';
                      const charCount = countChars(value);
                      const hasError = Boolean(field.state.meta.errors?.length);

                      return (
                        
                          <>
                            <textarea
                              id="content"
                              value={value}
                              placeholder="Viết gì đó..."
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              className={cn(
                                'w-full rounded-xl border border-gray-200 bg-transparent',
                                'px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400',
                                'focus:outline-none focus:ring-2 focus:ring-sky-500',

                                'min-h-24 max-h-40 overflow-y-auto resize-none',

                                'whitespace-pre-wrap wrap-break-word'
                              )}
                            />

                            {/* Counter + helper */}
                            <div className="mt-1 flex items-center justify-between text-xs">
                              <span
                                className={cn(
                                  'text-gray-500',
                                hasError && 'text-red-600'
                                )}
                              >
                                {charCount}/{MAX_WORDS} ký tự
                              </span>
                              {/* Emoji button nằm trong khung textarea */}
                              <EmojiButton
                                disabled={isPending}
                                popupSide="bottom"
                                align="right"
                                onPick={(emoji) => {
                                  const current = field.state.value ?? '';
                                  field.handleChange(current + emoji);
                                  const el = document.getElementById(
                                    'content'
                                  ) as HTMLTextAreaElement | null;
                                  el?.focus();
                                }}
                              />
                            </div>
                          </>
                       
                      );
                    }}
                  </form.Field>

                  {/* postId hidden field (đảm bảo luôn sync) */}
                  <form.Field name="postId">
                    {(field) => (
                      <input
                        type="hidden"
                        value={field.state.value ?? ''}
                        readOnly
                      />
                    )}
                  </form.Field>
                </div>
              </div>

              {/* Shared post preview (nằm trong scroll, hợp lý) */}
              {data && (
               
                  <SharedPostPreview post={data} />
              
              )}
            </div>
          </ScrollArea>

          {/* Footer cố định */}
          <DialogFooter className="shrink-0 border-t border-sky-100 bg-white/95 px-4 py-3">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Huỷ
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Đang chia sẻ…' : 'Chia sẻ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
