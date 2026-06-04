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
  FieldLabel,
} from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { LiveRegion } from '@/components/ui/live-region';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetUser, useUpdateUser } from '@/hooks/use-user-hook';
import { ImageIcon, Pencil } from '@/lib/icons';
import {
  INTEREST_OPTIONS,
  ProfileUpdateForm,
  ProfileUpdateSchema,
} from '@/models/user/userDTO';
import { useProfileModal } from '@/store/use-profile-modal';
import { useUser } from '@clerk/nextjs';
import { useForm } from '@tanstack/react-form';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const isFile = (value: unknown): value is File => value instanceof File;

const normalizePresetInterests = (
  interests?: string[],
): ProfileUpdateForm['interests'] =>
  interests?.filter((interest): interest is string => !!interest) ?? [];

export const ProfileModal = () => {
  const profileModal = useProfileModal();
  const {
    data: fetchedUser,
    isLoading,
    isError,
    error,
  } = useGetUser(profileModal.id as string);
  const { mutateAsync: updateUser, isPending } = useUpdateUser(
    profileModal.id as string,
  );
  const { user } = useUser();
  const [customInterest, setCustomInterest] = useState('');

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
      location: fetchedUser?.location ?? '',
      jobTitle: fetchedUser?.jobTitle ?? '',
      company: fetchedUser?.company ?? '',
      school: fetchedUser?.school ?? '',
      interests: normalizePresetInterests(fetchedUser?.interests),
    } satisfies ProfileUpdateForm,
    validators: {
      onSubmit: ({ value }) => {
        const result = ProfileUpdateSchema.safeParse(value);
        if (result.success) return undefined;
        return result.error.issues.map((issue) => issue.message);
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
      location: fetchedUser.location ?? '',
      jobTitle: fetchedUser.jobTitle ?? '',
      company: fetchedUser.company ?? '',
      school: fetchedUser.school ?? '',
      interests: normalizePresetInterests(fetchedUser.interests),
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
      <DialogContent className="max-w-lg overflow-hidden p-0">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold">
            Chỉnh sửa hồ sơ
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-4 p-5">
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
            <div className="space-y-5 p-5">
              <FieldGroup className="pr-2">
                <form.Field name="avatarUrl">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="avatar">Ảnh đại diện</FieldLabel>
                      <div className="flex items-center justify-center gap-4">
                        <input
                          hidden
                          type="file"
                          accept="image/*"
                          id="avatar"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            field.handleChange(
                              (file ??
                                undefined) as ProfileUpdateForm['avatarUrl'],
                            );
                          }}
                        />
                        <label
                          htmlFor="avatar"
                          className="group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-white shadow-sm"
                        >
                          <Image
                            src={avatarPreview}
                            alt="Ảnh đại diện"
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
                          field.handleChange(
                            (file ??
                              undefined) as ProfileUpdateForm['coverImageUrl'],
                          );
                        }}
                      />
                      <label
                        htmlFor="cover-image"
                        className="group relative block h-28 w-full cursor-pointer overflow-hidden rounded-xl border border-gray-200"
                      >
                        <Image
                          src={coverPreview}
                          alt="Ảnh bìa"
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
                        <FieldLabel htmlFor="lastName">
                          Họ và tên đệm
                        </FieldLabel>
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

                <div className="grid gap-4 md:grid-cols-2">
                  <form.Field name="location">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor="location">Khu vực</FieldLabel>
                        <InputGroup className="rounded-xl">
                          <InputGroupInput
                            id="location"
                            name={field.name}
                            value={field.state.value ?? ''}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Ví dụ: Thành phố Hồ Chí Minh"
                            disabled={isPending}
                          />
                        </InputGroup>
                      </Field>
                    )}
                  </form.Field>

                  <form.Field name="school">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor="school">Trường học</FieldLabel>
                        <InputGroup className="rounded-xl">
                          <InputGroupInput
                            id="school"
                            name={field.name}
                            value={field.state.value ?? ''}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Ví dụ: HCMUT"
                            disabled={isPending}
                          />
                        </InputGroup>
                      </Field>
                    )}
                  </form.Field>

                  <form.Field name="jobTitle">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor="jobTitle">Chức danh</FieldLabel>
                        <InputGroup className="rounded-xl">
                          <InputGroupInput
                            id="jobTitle"
                            name={field.name}
                            value={field.state.value ?? ''}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Ví dụ: Product Designer"
                            disabled={isPending}
                          />
                        </InputGroup>
                      </Field>
                    )}
                  </form.Field>

                  <form.Field name="company">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor="company">Công ty</FieldLabel>
                        <InputGroup className="rounded-xl">
                          <InputGroupInput
                            id="company"
                            name={field.name}
                            value={field.state.value ?? ''}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Ví dụ: Acme Social"
                            disabled={isPending}
                          />
                        </InputGroup>
                      </Field>
                    )}
                  </form.Field>
                </div>

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
                            className="max-h-40 min-h-24 overflow-y-auto"
                          />
                          <InputGroupAddon align="block-end">
                            <InputGroupText className="tabular-nums">
                              {value.length}/255
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

                <form.Field name="interests">
                  {(field) => {
                    const interests = field.state.value ?? [];

                    const handleAddCustomInterest = () => {
                      const trimmed = customInterest.trim();
                      if (!trimmed) return;
                      if (interests.includes(trimmed)) {
                        setCustomInterest('');
                        return;
                      }
                      if (interests.length >= 10) return;
                      field.handleChange([...interests, trimmed]);
                      setCustomInterest('');
                    };

                    return (
                      <Field>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <FieldLabel htmlFor="interests">
                            Sở thích và chủ đề quan tâm
                          </FieldLabel>
                          <span className="text-xs text-slate-500">
                            {interests.length}/10
                          </span>
                        </div>
                        <div
                          id="interests"
                          className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <div className="flex flex-wrap gap-2">
                            {INTEREST_OPTIONS.map((option) => {
                              const selected = interests.includes(option);
                              const reachedLimit =
                                !selected && interests.length >= 10;

                              return (
                                <Button
                                  key={option}
                                  type="button"
                                  size="sm"
                                  variant={selected ? 'default' : 'outline'}
                                  className={
                                    selected
                                      ? 'rounded-full bg-sky-500 text-white hover:bg-sky-600'
                                      : 'rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                                  }
                                  disabled={isPending || reachedLimit}
                                  onClick={() => {
                                    field.handleChange(
                                      selected
                                        ? interests.filter(
                                            (item) => item !== option,
                                          )
                                        : [...interests, option],
                                    );
                                  }}
                                >
                                  {option}
                                </Button>
                              );
                            })}

                            {/* Custom interests */}
                            {interests
                              .filter(
                                (i) => !INTEREST_OPTIONS.includes(i as any),
                              )
                              .map((option) => (
                                <Button
                                  key={`custom-${option}`}
                                  type="button"
                                  size="sm"
                                  variant="default"
                                  className="rounded-full bg-sky-500 text-white hover:bg-sky-600"
                                  disabled={isPending}
                                  onClick={() => {
                                    field.handleChange(
                                      interests.filter(
                                        (item) => item !== option,
                                      ),
                                    );
                                  }}
                                >
                                  {option} ✕
                                </Button>
                              ))}
                          </div>

                          <div className="flex gap-2">
                            <InputGroup className="rounded-full bg-white flex-1">
                              <InputGroupInput
                                value={customInterest}
                                onChange={(e) =>
                                  setCustomInterest(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddCustomInterest();
                                  }
                                }}
                                placeholder="Thêm sở thích khác..."
                                disabled={isPending || interests.length >= 10}
                              />
                            </InputGroup>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full px-3"
                              onClick={handleAddCustomInterest}
                              disabled={
                                isPending ||
                                !customInterest.trim() ||
                                interests.length >= 10
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">
                          Chọn tối đa 10 mục để hệ thống đề xuất bạn bè sát hơn.
                        </p>
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={!form.state.isDirty || isPending}>
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
