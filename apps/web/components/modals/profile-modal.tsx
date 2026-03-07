'use client';

import { ErrorFallback } from '@/components/error-fallback';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetUser, useUpdateUser } from '@/hooks/use-user-hook';
import { LiveRegion } from '@/components/ui/live-region';
import { ProfileUpdateForm, ProfileUpdateSchema } from '@/models/user/userDTO';
import { useProfileModal } from '@/store/use-profile-modal';
import { useUser } from '@clerk/nextjs';
import { useForm } from '@tanstack/react-form';
import { ImageIcon, Pencil } from '@/lib/icons';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

const isFile = (value: unknown): value is File => value instanceof File;

export const ProfileModal = () => {
  const profileModal = useProfileModal();
  const {
    data: fetchedUser,
    isLoading,
    isError,
    error,
  } = useGetUser(profileModal.id as string);
  const { mutateAsync: updateUser, isPending } = useUpdateUser(
    profileModal.id as string
  );
  const { user } = useUser();

  const form = useForm({
    defaultValues: {
      avatarUrl: (fetchedUser?.avatarUrl ??
        undefined) as ProfileUpdateForm['avatarUrl'],
      coverImageUrl: (fetchedUser?.coverImage?.url ??
        fetchedUser?.coverImageUrl ??
        undefined) as ProfileUpdateForm['coverImageUrl'],
      firstName: fetchedUser?.firstName ?? '',
      lastName: fetchedUser?.lastName ?? '',
      bio: fetchedUser?.bio ?? '',
    } satisfies ProfileUpdateForm,

    validators: {
      onSubmit: ({ value }) => {
        const result = ProfileUpdateSchema.safeParse(value);
        if (result.success) return undefined;
        return result.error.issues.map((i) => i.message);
      },
    },

    onSubmit: async ({ value }) => {
      const promise = updateUser(value, {
        onSuccess: () => {
          profileModal.onClose();
          user?.reload();
        },
      });

      toast.promise(promise, { loading: 'Đang cập nhật hồ sơ...' });
      await promise;
    },
  });

  useEffect(() => {
    if (!fetchedUser) return;
    form.reset({
      avatarUrl: (fetchedUser.avatarUrl ??
        undefined) as ProfileUpdateForm['avatarUrl'],
      coverImageUrl: (fetchedUser.coverImage?.url ??
        fetchedUser.coverImageUrl ??
        undefined) as ProfileUpdateForm['coverImageUrl'],
      firstName: fetchedUser.firstName ?? '',
      lastName: fetchedUser.lastName ?? '',
      bio: fetchedUser.bio ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedUser]);

  const avatarFile = form.state.values.avatarUrl;
  const coverFile = form.state.values.coverImageUrl;

  const avatarPreview = useMemo(() => {
    if (isFile(avatarFile)) return URL.createObjectURL(avatarFile);
    return fetchedUser?.avatarUrl || '/images/placeholder.png';
  }, [avatarFile, fetchedUser?.avatarUrl]);

  const coverPreview = useMemo(() => {
    if (isFile(coverFile)) return URL.createObjectURL(coverFile);
    return (
      fetchedUser?.coverImage?.url ||
      fetchedUser?.coverImageUrl ||
      '/images/placeholder-bg.png'
    );
  }, [coverFile, fetchedUser?.coverImage?.url, fetchedUser?.coverImageUrl]);

  useEffect(() => {
    if (!isFile(avatarFile)) return;
    return () => URL.revokeObjectURL(avatarPreview);
  }, [avatarFile, avatarPreview]);

  useEffect(() => {
    if (!isFile(coverFile)) return;
    return () => URL.revokeObjectURL(coverPreview);
  }, [coverFile, coverPreview]);

  return (
    <Dialog open={profileModal.isOpen} onOpenChange={profileModal.onClose}>
      <LiveRegion 
        message={isPending ? 'Đang cập nhật hồ sơ...' : ''} 
        politeness="polite"
      />
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold">
            Chỉnh sửa hồ sơ
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="p-5 space-y-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        )}

        {isError && (
          <div className="p-5">
            <ErrorFallback message={error.message} />
          </div>
        )}

        {!isLoading && !isError && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="p-5 space-y-5">
              <FieldGroup className="pr-2">
              <form.Field name="avatarUrl">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="avatar">Avatar</FieldLabel>
                    <div className="flex items-center justify-center gap-4">
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        id="avatar"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          const nextValue =
                            (file ?? undefined) as ProfileUpdateForm['avatarUrl'];
                          field.handleChange(nextValue);
                        }}
                      />
                      <label
                        htmlFor="avatar"
                        className="group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-white shadow-sm"
                      >
                        <Image
                          src={avatarPreview}
                          alt="Avatar"
                          width={80}
                          height={80}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 hidden items-center justify-center bg-black/35 group-hover:flex">
                          <Pencil className="h-5 w-5 text-white" />
                        </div>
                      </label>
             
                    </div>
                  </Field>
                )}
              </form.Field>

              <form.Field name="coverImageUrl">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="cover-image">Ảnh bìa</FieldLabel>
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      id="cover-image"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        const nextValue =
                          (file ?? undefined) as ProfileUpdateForm['coverImageUrl'];
                        field.handleChange(nextValue);
                      }}
                    />
                    <label
                      htmlFor="cover-image"
                      className="group relative block h-28 w-full cursor-pointer overflow-hidden rounded-xl border border-gray-200"
                    >
                      <Image
                        src={coverPreview}
                        alt="Cover image"
                        fill
                        loading="lazy"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 hidden items-center justify-center bg-black/35 group-hover:flex">
                        <div className="flex items-center gap-2 text-sm text-white">
                          <ImageIcon className="h-4 w-4" />
                          Thay ảnh bìa
                        </div>
                      </div>
                    </label>
                  </Field>
                )}
              </form.Field>

              <form.Field name="lastName">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="lastName">Họ và tên đệm</FieldLabel>
                      <InputGroup className="rounded-xl">
                        <InputGroupInput
                          id="lastName"
                          name={field.name}
                          value={field.state.value ?? ''}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Nhập họ và tên đệm"
                          disabled={isPending}
                          aria-invalid={isInvalid}
                        />
                      </InputGroup>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="firstName">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="firstName">Tên</FieldLabel>
                      <InputGroup className="rounded-xl">
                        <InputGroupInput
                          id="firstName"
                          name={field.name}
                          value={field.state.value ?? ''}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Nhập tên"
                          disabled={isPending}
                          aria-invalid={isInvalid}
                        />
                      </InputGroup>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="bio">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const value = (field.state.value ?? '') as string;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="bio">Tiểu sử</FieldLabel>
                      <InputGroup className="rounded-xl">
                        <InputGroupTextarea
                          id="bio"
                          name={field.name}
                          value={value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Viết vài dòng về bạn..."
                          rows={3}
                          disabled={isPending}
                          aria-invalid={isInvalid}
                          className="min-h-24 max-h-40 overflow-y-auto"
                        />
                        <InputGroupAddon align="block-end">
                          <InputGroupText className="tabular-nums">
                            {value.length}/160
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

            <DialogFooter>
              <Button
                type="submit"
                disabled={!form.state.isDirty || isPending}
              >
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
