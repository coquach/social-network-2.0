'use client';

import { useSharePost, Audience } from '@repo/shared';
import {
  CreateShareInputSchema
} from '@repo/shared/schemas';
import { useCreateShareModal } from '@/store/use-post-modal';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';

import { AudienceSelect } from '@/components/audience-select';
import { CreatePostAvatar } from '@/components/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group';
import { useAuth } from '@clerk/nextjs';
import { LiveRegion } from '@/components/ui/live-region';
import { countChars } from '@/utils/count-chars';

const MAX_WORDS = 1000;

export const CreateShareModal = () => {
  const { isOpen, closeModal, data } = useCreateShareModal();
  const { userId } = useAuth();
  const { mutateAsync: sharePost, isPending } = useSharePost();

  const postId = typeof data === 'string' ? data : (data as any)?.postId ?? '';

  const form = useForm({
    defaultValues: {
      postId,
      content: '',
      audience: Audience.PUBLIC,
    },
    onSubmit: async ({ value }) => {
      // validate toàn form bằng zod
      const parsed = CreateShareInputSchema.safeParse(value);
      if (!parsed.success) {
        toast.error('Nội dung không hợp lệ');
        return;
      }

      const p = sharePost({
        postId: value.postId,
        content: value.content,
        audience: value.audience,
      }).then(() => {
        toast.success('Đã chia sẻ bài viết thành công!');
        closeModal();
        form.reset();
      });

      toast.promise(p, {
        loading: 'Đang chia sẻ bài viết...',
      });

      try {
        await p;
      } catch (err) {
        // Error handled by mutation
      }
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <LiveRegion 
        message={isPending ? 'Đang chia sẻ bài viết...' : ''} 
        politeness="polite"
      />
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b border-sky-100 bg-white/95 px-4 py-3">
          <DialogTitle className="text-base font-semibold text-center">
            Chia sẻ bài viết
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-gray-500 mt-1">
            Nội dung chia sẻ sẽ xuất hiện trên bảng tin của bạn.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="p-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <CreatePostAvatar userId={userId as string} />
            <form.Field
              name="audience"
              children={(field) => (
                <AudienceSelect
                  value={field.state.value}
                  onChange={field.handleChange}
                />
              )}
            />
          </div>

          <form.Field
            name="content"
            children={(field) => (
              <InputGroup className="rounded-xl">
                <InputGroupTextarea
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Nói gì đó về bài viết này..."
                  rows={4}
                  className="min-h-24 resize-none"
                  disabled={isPending}
                />
                <InputGroupAddon align="block-end">
                    <InputGroupText className="tabular-nums">
                        {countChars(field.state.value)}/{MAX_WORDS}
                    </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            )}
          />

          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={isPending}
            >
              Hủy
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
