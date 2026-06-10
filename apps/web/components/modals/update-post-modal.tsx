'use client';

import { useUpdatePost, PostSnapshotDTO, UpdatePostInput, Audience } from '@repo/shared';
import { LiveRegion } from '@/components/ui/live-region';
import {
  UpdatePostInputSchema,
} from '@repo/shared/schemas';
import { useUpdatePostModal } from '@/store/use-post-modal';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { AudienceSelect } from '@/components/audience-select';
import { LargeAvatar } from '@/components/avatar';
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
import { cn } from '@/lib/utils';
import { countChars } from '@/utils/count-chars';

const MAX_WORDS = 2000;

// Hoisted helper to prevent re-creation of default values
const getDefaultFormValues = (snapshot?: PostSnapshotDTO): UpdatePostInput => ({
  content: snapshot?.content ?? '',
  audience: snapshot?.audience ?? Audience.PUBLIC,
});

export const UpdatePostModal = () => {
  const { isOpen, closeModal, data } = useUpdatePostModal();


  const snapshot = data as PostSnapshotDTO;
  const form = useForm<UpdatePostInput>({
    defaultValues: getDefaultFormValues(snapshot),
  });

  const { mutateAsync: updatePost, isPending } = useUpdatePost(snapshot?.postId ?? '');

  useEffect(() => {
    form.reset(getDefaultFormValues(snapshot));
  }, [snapshot, form]);

  const handleSubmit = (vals: UpdatePostInput) => {
    // Validate with Zod
    const result = UpdatePostInputSchema.safeParse(vals);
    if (!result.success) {
      toast.error('Nội dung không hợp lệ');
      return;
    }

    const p = updatePost(vals).then(() => {
      toast.success('Đã cập nhật bài viết!');
      closeModal();
    });

    toast.promise(p, {
      loading: 'Đang cập nhật bài viết...',
    });
  };

  const currentContent = form.watch('content') ?? '';

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <LiveRegion 
        message={isPending ? 'Đang cập nhật bài viết...' : ''} 
        politeness="polite"
      />
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b border-sky-100 bg-white/95 px-4 py-3">
          <DialogTitle className="text-base font-semibold text-center">
            Chỉnh sửa bài viết
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-gray-500 mt-1">
             Cập nhật nội dung hoặc chế độ hiển thị cho bài viết của bạn.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <LargeAvatar userId={snapshot?.userId ?? ''} />
            <div>
              <AudienceSelect
                value={form.watch('audience') ?? Audience.PUBLIC}
                onChange={(val) => form.setValue('audience', val as Audience)}
              />
            </div>
          </div>

          <InputGroup className="rounded-xl">
            <InputGroupTextarea
              {...form.register('content')}
              placeholder="Bạn đang nghĩ gì?"
              rows={5}
              className={cn(
                'max-h-40 resize-none overflow-y-auto min-h-10',
                'whitespace-pre-wrap wrap-break-word'
              )}
              disabled={isPending}
            />
            <InputGroupAddon align="block-end">
              <InputGroupText className="tabular-nums">
                {countChars(currentContent)}/{MAX_WORDS}
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>

          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}

            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
