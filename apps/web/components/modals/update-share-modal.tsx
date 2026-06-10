'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { LiveRegion } from '@/components/ui/live-region';
import { cn } from '@/lib/utils';
import { useUpdateSharePostModal } from '@/store/use-post-modal';
import { countChars } from '@/utils/count-chars';
import { useUpdateShare, SharePostSnapshotDTO, UpdateShareInput, Audience } from '@repo/shared';
import {
  UpdateShareInputSchema,
} from '@repo/shared/schemas';

const MAX_WORDS = 1000;

export const UpdateShareModal = () => {
  const { isOpen, closeModal, data } = useUpdateSharePostModal();

  const snapshot = data as SharePostSnapshotDTO;
  const form = useForm<UpdateShareInput>({
    defaultValues: {
      content: snapshot?.content ?? '',
      audience: snapshot?.audience ?? Audience.PUBLIC,
    },
  });

  const { mutateAsync: updateShare, isPending } = useUpdateShare(
    snapshot?.shareId ?? ''
  );

  useEffect(() => {
    form.reset({
      content: snapshot?.content ?? '',
      audience: snapshot?.audience ?? Audience.PUBLIC,

    });
  }, [snapshot, form]);

  const handleSubmit = (vals: UpdateShareInput) => {
    // Validate with Zod
    const result = UpdateShareInputSchema.safeParse(vals);
    if (!result.success) {
      toast.error('Nội dung không hợp lệ');
      return;
    }

    const p = updateShare(vals).then(() => {
      toast.success('Đã cập nhật bài chia sẻ!');
      closeModal();
    });

    toast.promise(p, {
      loading: 'Đang cập nhật...',
    });
  };

  const currentContent = form.watch('content') ?? '';

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <LiveRegion 
        message={isPending ? 'Đang cập nhật...' : ''} 
        politeness="polite"
      />
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b border-sky-100 bg-white/95 px-4 py-3">
          <DialogTitle className="text-base font-semibold text-center">
            Chỉnh sửa chia sẻ
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-gray-500 mt-1">
            Cập nhật nội dung hoặc chế độ hiển thị cho bài chia sẻ của bạn.
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
              placeholder="Nói gì đó về bài viết này..."
              rows={4}
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
