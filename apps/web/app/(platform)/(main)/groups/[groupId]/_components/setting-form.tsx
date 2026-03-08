'use client';

import { useForm } from '@tanstack/react-form';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { useGroupPermissionContext } from '@/contexts/group-permission-context';
import { GroupPermission } from '@/models/group/enums/group-permission.enum';
import { GroupSettingSchema } from '@/models/group/groupSettingDTO';

import { Loader } from '@/components/loader-componnet';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldTitle,
} from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  useGroupSettings,
  useUpdateGroupSettings,
} from '@repo/shared';
import { cn } from '@/lib/utils';

type SettingFormProps = {
  open: boolean;
};

export const SettingForm = ({ open }: SettingFormProps) => {
  const { group, can } = useGroupPermissionContext();
  const canViewSettings = can(GroupPermission.VIEW_SETTINGS);
  const canEditSettings = can(GroupPermission.UPDATE_GROUP_SETTINGS);

  const shouldFetchSettings = open && !!group && canViewSettings;
  const { data: settingsData, isLoading } = useGroupSettings(
    shouldFetchSettings ? group!.id : ''
  );

  const { mutate: updateSettingsMutate, isPending } = useUpdateGroupSettings();

  const form = useForm({
    defaultValues: {
      requiredPostApproval: false,
      requireAdminApprovalToJoin: false,
      allowMemberInvite: false,
      maxMembers: 1,
    },

    validators: {
      onSubmit: ({ value }) => {
        const result = GroupSettingSchema.safeParse(value);
        if (result.success) return undefined;
        return result.error.issues.map((i) => i.message);
      },
    },

    onSubmit: async ({ value }) => {
      if (!group || !canEditSettings) return;

      const promise = new Promise<void>((resolve, reject) => {
        updateSettingsMutate(
          {
            groupId: group.id,
            input: {
              requiredPostApproval: value.requiredPostApproval,
              maxMembers: value.maxMembers,
              requireAdminApprovalToJoin: value.requireAdminApprovalToJoin,
              allowMemberInvite: value.allowMemberInvite,
            },
          },
          {
            onSuccess: () => resolve(),
            onError: (error: unknown) => reject(error),
          }
        );
      });

      toast.promise(promise, { loading: 'Đang lưu cài đặt nhóm...' });
      await promise;
    },
  });

  useEffect(() => {
    if (!settingsData || !open) return;
    form.reset({
      requiredPostApproval: settingsData.requiredPostApproval,
      requireAdminApprovalToJoin: settingsData.requireAdminApprovalToJoin,
      allowMemberInvite: settingsData.allowMemberInvite,
      maxMembers: settingsData.maxMembers ?? 1,
    });
  }, [settingsData, open, form]);

  if (!canViewSettings) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <ScrollArea className="flex-1 min-h-0">
          <div className="rounded-xl border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
            Bạn không có quyền xem cài đặt nhóm này.
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ScrollArea className="flex-1 min-h-0">
        <form
          id="group-setting-form"
          className="min-h-full"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className=" bg-white p-4 shadow-sm">
            <div>
              <h3 className="text-lg font-semibold text-sky-500">
                Cài đặt nhóm
              </h3>
              <p className="text-xs text-muted-foreground">
                Điều chỉnh cách thành viên tham gia và đăng bài trong nhóm.
              </p>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader size={32} />
              </div>
            )}

            {!isLoading && !settingsData && (
              <p className="text-sm text-muted-foreground">
                Không thể tải cài đặt nhóm.
              </p>
            )}

            {!isLoading && settingsData && (
              <div className="mt-5 space-y-5">
                <div className="rounded-xl border bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <div className="text-sm font-medium">
                        Yêu cầu phê duyệt bài đăng
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Nếu bật, bài đăng mới cần admin/mod phê duyệt trước khi
                        hiển thị.
                      </p>
                    </div>
                    <form.Field name="requiredPostApproval">
                      {(field) => (
                        <Switch
                          checked={!!field.state.value}
                          onCheckedChange={(checked) =>
                            field.handleChange(checked)
                          }
                          disabled={!canEditSettings}
                        />
                      )}
                    </form.Field>
                  </div>
                </div>

                <div className="rounded-xl border bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <div className="text-sm font-medium">
                        Yêu cầu admin phê duyệt yêu cầu tham gia
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Nếu bật, yêu cầu tham gia cần admin/phê duyệt thủ công.
                      </p>
                    </div>
                    <form.Field name="requireAdminApprovalToJoin">
                      {(field) => (
                        <Switch
                          checked={!!field.state.value}
                          onCheckedChange={(checked) =>
                            field.handleChange(checked)
                          }
                          disabled={!canEditSettings}
                        />
                      )}
                    </form.Field>
                  </div>
                </div>

                <div className="rounded-xl border bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <div className="text-sm font-medium">
                        Cho phép thành viên mời người mới
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Nếu bật, thành viên có thể mời người khác vào nhóm.
                      </p>
                    </div>
                    <form.Field name="allowMemberInvite">
                      {(field) => (
                        <Switch
                          checked={!!field.state.value}
                          onCheckedChange={(checked) =>
                            field.handleChange(checked)
                          }
                          disabled={!canEditSettings}
                        />
                      )}
                    </form.Field>
                  </div>
                </div>

                <FieldGroup>
                  <form.Field
                    name="maxMembers"
                    validators={{
                      onChange: ({ value }) => {
                        if (!Number.isInteger(value))
                          return { message: 'Phải là số nguyên.' };
                        if (value < 1) return { message: 'Tối thiểu 1.' };
                        return undefined;
                      },
                    }}
                  >
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldTitle>Giới hạn số thành viên</FieldTitle>
                          <InputGroup className="rounded-xl">
                            <InputGroupInput
                              type="number"
                              min={1}
                              value={field.state.value ?? 1}
                              onBlur={field.handleBlur}
                              onChange={(e) => {
                                if (!canEditSettings) return;
                                const value = Number(e.target.value);
                                field.handleChange(
                                  Number.isNaN(value) ? 0 : value
                                );
                              }}
                              readOnly={!canEditSettings}
                              aria-invalid={isInvalid}
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupText
                                className={cn(isInvalid && 'text-red-600')}
                              >
                                thành viên
                              </InputGroupText>
                            </InputGroupAddon>
                          </InputGroup>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  </form.Field>
                </FieldGroup>
              </div>
            )}
          </div>
        </form>
      </ScrollArea>

      <div className="shrink-0 border-t bg-background px-6 md:px-8 py-2">
        {canEditSettings && (
          <div className="flex justify-end">
            <Button
              type="submit"
              form="group-setting-form"
              disabled={isPending || isLoading || !settingsData}
            >
              {isPending ? 'Đang lưu...' : 'Lưu cài đặt'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
