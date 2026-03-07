'use client';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useGroupPermissionContext } from '@/contexts/group-permission-context';
import {
  GroupReportSchema,
  CreateGroupReportForm,
} from '@/models/group/groupReportDTO';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateGroupReport } from '@repo/shared';

type GroupReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const GroupReportDialog = ({
  open,
  onOpenChange,
}: GroupReportDialogProps) => {
  const { group } = useGroupPermissionContext();

  const form = useForm<CreateGroupReportForm>({
    defaultValues: {
      reason: '',
    },
    mode: 'onChange',
  });

  const { mutate: createReport, isPending } = useCreateGroupReport();
  if (!group) return null;
  const onSubmit = (values: CreateGroupReportForm) => {
    // Validate with Zod
    const result = GroupReportSchema.safeParse(values);
    if (!result.success) {
      toast.error('Lý do không hợp lệ');
      return;
    }

    const promise = new Promise<void>((resolve, reject) => {
      createReport({ groupId: group.id, data: result.data }, {
        onSuccess: () => {
          toast.success('Đã gửi báo cáo nhóm tới quản trị viên hệ thống');
          form.reset();
          onOpenChange(false);
          resolve();
        },
        onError: (err: any) => {
          console.error(err);
          reject(
            err?.message ??
              new Error('Không thể gửi báo cáo nhóm, vui lòng thử lại')
          );
        },
      });
    });

    toast.promise(promise, {
      loading: 'Đang gửi báo cáo...',
      success: 'Đã gửi báo cáo nhóm tới quản trị viên hệ thống',
      error: 'Không thể gửi báo cáo nhóm, vui lòng thử lại',
    });
  };

  const reasonError = form.formState.errors.reason?.message;
  const reasonValue = form.watch('reason') ?? '';

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) form.reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[80vh] overflow-x-auto p-0">
        <DialogHeader>
          <DialogTitle className="text-center">
            Báo cáo nhóm
          </DialogTitle>
          <DialogDescription>
            Cho chúng tôi biết lý do bạn muốn báo cáo nhóm <b>{group.name}</b>.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-1.5 px-5">
            <label className="text-sm font-medium">
              Lý do báo cáo
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <Textarea
              rows={5}
              placeholder="Ví dụ: Nhóm chia sẻ nội dung spam, vi phạm quy định..."
              className="
                min-h-[120px]
                w-full
                resize-none
                whitespace-pre-wrap
              "
              maxLength={1000}
              {...form.register('reason')}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className={reasonError ? 'text-red-500' : ''}>
                {reasonError ||
                  'Hãy mô tả chi tiết, rõ ràng để quản trị viên dễ xử lý hơn.'}
              </span>
              <span>{reasonValue.length}/1000</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.formState.isDirty}
            >
              {isPending ? 'Đang gửi...' : 'Gửi báo cáo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
