'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { AudienceSelect } from '@/components/audience-select';
import { LargeAvatar } from '@/components/avatar';
import { FormTextarea } from '@/components/form/form-textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useUpdatePost } from '@/hooks/use-post-hook';
import { Audience } from '@/models/social/enums/social.enum';
import { LiveRegion } from '@/components/ui/live-region';
import {
  PostSnapshotDTO,
  UpdatePostForm,
  UpdatePostSchema,
} from '@/models/social/post/postDTO';
import { useUpdatePostModal } from '@/store/use-post-modal';

// Hoisted helper to prevent re-creation of default values
const getDefaultFormValues = (snapshot?: PostSnapshotDTO): UpdatePostForm => ({
  content: snapshot?.content ?? '',
  audience: snapshot?.audience ?? Audience.PUBLIC,
});

export const UpdatePostModal = () => {
  const { isOpen, closeModal, data } = useUpdatePostModal();


  const snapshot = data as PostSnapshotDTO;
  const form = useForm<UpdatePostForm>({
    defaultValues: getDefaultFormValues(snapshot),
  });

  const { mutateAsync: updatePost, isPending } = useUpdatePost(snapshot?.postId ?? '');

  useEffect(() => {
    form.reset(getDefaultFormValues(snapshot));
  }, [snapshot, form]);

  const handleSubmit = (vals: UpdatePostForm) => {
    // Validate with Zod
    const result = UpdatePostSchema.safeParse(vals);
    if (!result.success) {
      toast.error('Dữ liệu không hợp lệ');
      return;
    }
    const promise = updatePost(result.data).then(() => closeModal());
    toast.promise(promise, { loading: 'Đang cập nhật bài viết...' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <LiveRegion 
        message={isPending ? 'Đang cập nhật bài viết...' : ''} 
        politeness="polite"
      />
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b border-sky-100 bg-white/95 px-4 py-3">
          <DialogTitle className="text-lg font-semibold text-center">
            Chỉnh sửa bài viết
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
                placeholder="Cập nhật nội dung..."
                defaultValue={form.getValues('content')}
                className="w-full resize-none bg-transparent text-sm placeholder-gray-400 text-gray-700"
                errors={form.formState.errors}
                {...form.register('content')}
              />
            </div>
          </div>

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
