'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { PencilLine, UserCircle2 } from 'lucide-react';

import { useGroupPermissionContext } from '@/contexts/group-permission-context';
import { GroupPermission } from '@/models/group/enums/group-permission.enum';
import { UpdateGroupSchema } from '@/models/group/groupDTO';
import type { UpdateGroupForm as UpdateGroupFormValues } from '@/models/group/groupDTO';
import { MediaType } from '@/models/social/enums/social.enum';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldTitle,
} from '@/components/ui/field';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { useUpdateGroup } from '@repo/shared';
import { MediaItem } from '@/lib/types/media';
import { cn } from '@/lib/utils';
import { countChars } from '@/utils/count-chars';

type UpdateGroupFormProps = {
  open: boolean;
};

const MAX_NAME = 100;
const MAX_DESCRIPTION = 1000;

export const UpdateGroupForm = ({ open }: UpdateGroupFormProps) => {
  const { group, can } = useGroupPermissionContext();
  const canEditInfo = can(GroupPermission.UPDATE_GROUP);

  const { mutate: updateGroupMutate, isPending } = useUpdateGroup(
    group?.id ?? ''
  );

  const [avatarMedia, setAvatarMedia] = useState<MediaItem | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!avatarMedia) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarMedia.file);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarMedia]);

  const [coverMedia, setCoverMedia] = useState<MediaItem | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!coverMedia) {
      setCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(coverMedia.file);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverMedia]);

  const form = useForm({
    defaultValues: {
      name: group?.name ?? '',
      description: group?.description ?? '',
    } satisfies UpdateGroupFormValues,

    validators: {
      onSubmit: ({ value }) => {
        const result = UpdateGroupSchema.safeParse({
          name: value.name?.trim() || undefined,
          description: value.description?.trim() || undefined,
        });
        if (result.success) return undefined;
        return result.error.issues.map((i) => i.message);
      },
    },

    onSubmit: async ({ value }) => {
      if (!group || !canEditInfo) return;

      const promise = new Promise<void>((resolve, reject) => {
        updateGroupMutate(
          {
            form: {
              name: value.name.trim(),
              description: value.description?.trim() || undefined,
            },
            avatar: avatarMedia ?? undefined,
            cover: coverMedia ?? undefined,
          },
          {
            onSuccess: () => {
              setAvatarMedia(null);
              setCoverMedia(null);
              resolve();
            },
            onError: (error: unknown) => {
              reject(error);
            },
          }
        );
      });

      toast.promise(promise, { loading: 'Đang lưu thông tin nhóm...' });
      await promise;
    },
  });

  useEffect(() => {
    if (!open || !group) return;
    form.reset({
      name: group.name ?? '',
      description: group.description ?? '',
    });
    setAvatarMedia(null);
    setAvatarPreview(null);
    setCoverMedia(null);
    setCoverPreview(null);
  }, [open, group?.id, group, form]);

  const handleAvatarInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canEditInfo) return;

    setAvatarMedia({
      file,
      type: MediaType.IMAGE,
    });
  };

  const handleCoverInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canEditInfo) return;

    setCoverMedia({
      file,
      type: MediaType.IMAGE,
    });
  };

  const currentAvatarUrl = useMemo(
    () => avatarPreview || group?.avatarUrl || '',
    [avatarPreview, group?.avatarUrl]
  );

  const currentCoverUrl = useMemo(
    () => coverPreview || group?.coverImageUrl || '',
    [coverPreview, group?.coverImageUrl]
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ScrollArea className="flex-1 min-h-0">
        <form
          id="update-group-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className=" bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-sky-500">
                  Thông tin nhóm
                </h3>
                <p className="text-xs text-muted-foreground">
                  Cập nhật tên, mô tả và ảnh cover của nhóm.
                </p>
              </div>

              {!canEditInfo && (
                <div className="text-[11px] text-amber-600">
                  Bạn chỉ có quyền xem thông tin nhóm.
                </div>
              )}
            </div>

            <div className="mt-5 space-y-5">
              <div className="space-y-2">
                <div className="text-sm font-medium">Avatar nhóm</div>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border bg-muted">
                    {currentAvatarUrl ? (
                      <Image
                        src={currentAvatarUrl}
                        alt="Group avatar"
                        fill
                        loading="lazy"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <UserCircle2 className="h-10 w-10" />
                      </div>
                    )}
                  </div>

                  {canEditInfo && (
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById('group-avatar-input')?.click()
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white transition hover:bg-black/70"
                    >
                      <PencilLine className="h-4 w-4" />
                      Đổi ảnh
                    </button>
                  )}
                </div>

                <input
                  id="group-avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarInputChange}
                  disabled={!canEditInfo}
                />

                {avatarMedia && (
                  <div className="text-[11px] text-muted-foreground">
                    Đã chọn: {avatarMedia.file.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Ảnh cover</div>
                <div className="relative aspect-3/1 w-full overflow-hidden rounded-xl border bg-muted">
                  {currentCoverUrl ? (
                    <Image
                      src={currentCoverUrl}
                      alt="Group cover"
                      fill
                      loading="lazy"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      Nhóm chưa có ảnh cover
                    </div>
                  )}

                  {canEditInfo && (
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById('group-cover-input')?.click()
                      }
                      className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white transition hover:bg-black/70"
                    >
                      <PencilLine className="h-4 w-4" />
                      Đổi ảnh
                    </button>
                  )}
                </div>

                <input
                  id="group-cover-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverInputChange}
                  disabled={!canEditInfo}
                />

                {coverMedia && (
                  <div className="text-[11px] text-muted-foreground">
                    Đã chọn: {coverMedia.file.name}
                  </div>
                )}
              </div>

              <FieldGroup>
                <form.Field
                  name="name"
                  validators={{
                    onChange: ({ value }) => {
                      const count = countChars(value ?? '');
                      if (!count) return { message: 'Tên nhóm là bắt buộc.' };
                      if (count > MAX_NAME)
                        return { message: `Tối đa ${MAX_NAME} ký tự.` };
                      return undefined;
                    },
                  }}
                >
                  {(field) => {
                    const value = (field.state.value ?? '') as string;
                    const count = countChars(value);
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldTitle>Tên nhóm</FieldTitle>
                        <InputGroup className="rounded-xl">
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            readOnly={!canEditInfo}
                            aria-invalid={isInvalid}
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupText
                              className={cn(
                                'tabular-nums',
                                isInvalid && 'text-red-600'
                              )}
                            >
                              {count}/{MAX_NAME}
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

                <form.Field
                  name="description"
                  validators={{
                    onChange: ({ value }) => {
                      const count = countChars(value ?? '');
                      if (count > MAX_DESCRIPTION)
                        return { message: `Tối đa ${MAX_DESCRIPTION} ký tự.` };
                      return undefined;
                    },
                  }}
                >
                  {(field) => {
                    const value = (field.state.value ?? '') as string;
                    const count = countChars(value);
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldTitle>Mô tả</FieldTitle>
                        <InputGroup className="rounded-xl">
                          <InputGroupTextarea
                            id={field.name}
                            name={field.name}
                            value={value}
                            onBlur={field.handleBlur}
                            placeholder="Mô tả về nhóm..."
                            onChange={(e) => field.handleChange(e.target.value)}
                            readOnly={!canEditInfo}
                            rows={4}
                            aria-invalid={isInvalid}
                            className="min-h-24 max-h-40"
                          />
                          <InputGroupAddon align="block-end">
                            <InputGroupText
                              className={cn(
                                'tabular-nums',
                                isInvalid && 'text-red-600'
                              )}
                            >
                              {count}/{MAX_DESCRIPTION}
                            </InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                        <FieldDescription className="text-xs">
                          Hiển thị cho mọi người trong trang nhóm.
                        </FieldDescription>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>

              <div className="rounded-xl border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground">
                <div className="font-medium text-foreground">
                  Quyền riêng tư
                </div>
                <div className="mt-1">
                  Hiện tại:{' '}
                  <b>
                    {group?.privacy === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}
                  </b>
                </div>
                <p className="text-xs">
                  Thay đổi quyền riêng tư (nếu được phép) có thể thực hiện ở
                  đây.
                </p>
              </div>
            </div>
          </div>
        </form>
      </ScrollArea>

      <div className="shrink-0 border-t bg-background px-6 md:px-8 py-2">
        {canEditInfo && (
          <div className="flex justify-end">
            <Button type="submit" form="update-group-form" disabled={isPending}>
              {isPending ? 'Đang lưu...' : 'Lưu thông tin'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
