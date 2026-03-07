'use client';

import { useForm } from '@tanstack/react-form';

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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateSystemUser } from '@/hooks/use-admin-users';
import {
  CreateSystemUserSchema,
  SystemRole,
} from '@/models/user/systemUserDTO';
import { toast } from 'sonner';

const roleLabels: Record<SystemRole, string> = {
  [SystemRole.ADMIN]: 'Quản trị viên',
  [SystemRole.MODERATOR]: 'Điều hành viên',
  [SystemRole.USER]: 'Người dùng',
};

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
}: CreateUserDialogProps) {
  const { mutateAsync, isPending } = useCreateSystemUser();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: SystemRole.MODERATOR,
    },
    validators: {
      onSubmit: ({ value }) => {
        const r = CreateSystemUserSchema.safeParse(value);
        if (r.success) return undefined;
        return r.error.issues.map((i) => i.message);
      },
    },
    onSubmit: async ({ value, formApi }) => {
      const promise = mutateAsync(
        { form: value },
        {
          onSuccess: () => {
            formApi.reset();
            onOpenChange(false);
          },
        }
      );

      toast.promise(promise, { loading: 'Đang tạo người dùng...' });
      await promise;
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && onOpenChange(v)}>
      <DialogContent className="max-w-[520px] border-sky-100 overflow-hidden p-0">
        <DialogHeader className='p-4'>
          <DialogTitle>Tạo người dùng hệ thống</DialogTitle>
          <DialogDescription className="text-slate-600">
            Tạo tài khoản nội bộ với vai trò và thông tin đăng nhập riêng.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="px-4 space-y-4">
            <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <form.Field name="firstName">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Họ</FieldLabel>
                      <Input
                        placeholder="Nguyễn"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={isPending}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="lastName">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Tên</FieldLabel>
                      <Input
                        placeholder="Văn A"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={isPending}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>

            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      type="email"
                      placeholder="admin@company.com"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      disabled={isPending}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Mật khẩu</FieldLabel>
                    <Input
                      type="password"
                      placeholder="Tối thiểu 6 ký tự"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      disabled={isPending}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="role">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Vai trò hệ thống</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(value as SystemRole)
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger className="border-sky-100 focus:ring-sky-200">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(SystemRole).map((role) => {
                          if (role === SystemRole.USER) return null;
                          return (
                            <SelectItem key={role} value={role}>
                              {roleLabels[role]}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <div className="rounded-lg border border-dashed border-sky-100 bg-sky-50/50 p-3 text-xs text-slate-600">
              <div className="font-semibold text-slate-700">Lưu ý</div>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                <li>Email và mật khẩu sẽ dùng để đăng nhập vào hệ thống.</li>
                <li>
                  Bạn có thể cập nhật thêm thông tin sau khi tạo thành công.
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Đang tạo...' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
