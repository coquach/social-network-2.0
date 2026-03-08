'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { AudienceSelect } from '@/components/audience-select';
import { LargeAvatar } from '@/components/avatar';
import { FormTextarea } from '@/components/form/form-textarea';
import SharedPostPreview from '@/components/post/share-post-review';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useUpdateSharePost } from '@/hooks/use-share-hook';
import { Audience } from '@/models/social/enums/social.enum';
import {
  SharePostSnapshotDTO,
  UpdateSharePostForm,
  UpdateSharePostSchema,
} from '@/models/social/post/sharePostDTO';
import { useUpdateSharePostModal } from '@/store/use-post-modal';

export const UpdateSharePostModal = () => {
  const { isOpen, closeModal, data, } = useUpdateSharePostModal();


  const snapshot = data as SharePostSnapshotDTO;
  console.log('snapshot', snapshot);

  const form = useForm<UpdateSharePostForm>({
    defaultValues: {
      content: snapshot?.content ?? '',
      audience: snapshot?.audience ?? Audience.PUBLIC,
    },
  });

  const { mutateAsync: updateShare, isPending } = useUpdateSharePost(
    snapshot?.shareId ?? '',
    snapshot?.userId ?? ''
  );

  useEffect(() => {
    form.reset({
      content: snapshot?.content ?? '',
      audience: snapshot?.audience ?? Audience.PUBLIC,

    });
  }, [snapshot, form]);

  const handleSubmit = (vals: UpdateSharePostForm) => {
    // Validate with Zod
    const result = UpdateSharePostSchema.safeParse(vals);
    if (!result.success) {
      toast.error('Dữ liệu không hợp lệ');
      return;
    }
    const promise = updateShare(result.data).then(() => closeModal());
    toast.promise(promise, { loading: 'Đang cập nhật chia sẻ...' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b border-sky-100 bg-white/95 px-4 py-3">
          <DialogTitle className="text-lg font-semibold text-center">
            Chỉnh sửa chia sẻ
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex flex-row items-start gap-4 p-4">
            <LargeAvatar userId={snapshot?.userId} hasBorder />

            <div className="flex-1 space-y-2 p-2">
              <AudienceSelect
                value={form.watch('audience') as Audience}
                onChange={(val) => form.setValue('audience', val as never)}
              />

              <FormTextarea
                id="content"
                placeholder="Cập nhật nội dung chia sẻ..."
                defaultValue={form.getValues('content')}
                className="w-full resize-none bg-transparent text-sm placeholder-gray-400 text-gray-700"
                errors={form.formState.errors}
                {...form.register('content')}
              />
            </div>
          </div>

          {snapshot?.post && (
            <ScrollArea className="max-h-[60vh] p-4">
              <SharedPostPreview post={snapshot.post} />
            </ScrollArea>
          )}

          <DialogFooter>
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
