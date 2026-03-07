'use client';

import { useForm } from '@tanstack/react-form';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ImageIcon, PencilLine, UserCircle2, X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldTitle,
} from '@/components/ui/field';

import { useCreateGroup } from '@repo/shared';
import { MediaItem } from '@/lib/types/media';
import { cn } from '@/lib/utils';
import { countChars } from '@/utils/count-chars';
import { GroupPrivacy } from '@/models/group/enums/group-privacy.enum';
import { CreateGroupForm, GroupSchema } from '@/models/group/groupDTO';
import { MediaType } from '@/models/social/enums/social.enum';

type CreateGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const MAX_NAME = 100;
const MAX_DESCRIPTION = 1000;
const MAX_RULES = 2000;

export const CreateGroupDialog = ({
  open,
  onOpenChange,
}: CreateGroupDialogProps) => {
  const { mutateAsync: createGroupMutate, isPending } = useCreateGroup();

  const [avatarMedia, setAvatarMedia] = useState<MediaItem | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [coverMedia, setCoverMedia] = useState<MediaItem | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      privacy: GroupPrivacy.PUBLIC as GroupPrivacy,
      rules: '',
      groupCategoryId: undefined,
      avatar: undefined,
    } satisfies CreateGroupForm,

    validators: {
      onSubmit: ({ value }) => {
        const result = GroupSchema.safeParse({
          ...value,
          name: value.name?.trim() ?? '',
          description: value.description?.trim() || undefined,
          rules: value.rules?.trim() || undefined,
          groupCategoryId: value.groupCategoryId || undefined,
        });
        if (result.success) return undefined;
        return result.error.issues.map((i) => i.message);
      },
    },

    onSubmit: async ({ value }) => {
      if (!avatarMedia) {
        setAvatarError('Vui lòng chọn ảnh avatar cho nhóm.');

        return;
      }

      setAvatarError(null);

      const payload: CreateGroupForm = {
        ...value,
        name: value.name.trim(),
        description: value.description?.trim() || undefined,
        rules: value.rules?.trim() || undefined,
        groupCategoryId: value.groupCategoryId || undefined,
      };

      const promise = createGroupMutate({
        form: payload,
        avatar: avatarMedia ?? undefined,
        cover: coverMedia ?? undefined,
      });

      toast.promise(promise, { loading: 'Đang tạo nhóm...' });

      try {
        await promise;
        resetAll();
        onOpenChange(false);
      } catch {
        // handled by react-query + toast in hook
      }
    },
  });

  useEffect(() => {
    if (!avatarMedia) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarMedia.file);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarMedia, form]);

  useEffect(() => {
    if (!coverMedia) {
      setCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(coverMedia.file);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverMedia]);

  const resetAll = () => {
    form.reset();
    setAvatarMedia(null);
    setAvatarPreview(null);
    setAvatarError(null);
    setCoverMedia(null);
    setCoverPreview(null);
  };

  const handleInternalOpenChange = (o: boolean) => {
    if (!o) resetAll();
    onOpenChange(o);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarMedia({ file, type: MediaType.IMAGE });
    setAvatarError(null);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverMedia({ file, type: MediaType.IMAGE });
  };

  return (
    <Dialog open={open} onOpenChange={handleInternalOpenChange}>
      <DialogContent
        className="
          w-[95vw]
          sm:max-w-[720px]
          h-[95vh]
          p-0
          flex flex-col
          overflow-hidden
        "
      >
        <DialogHeader className="shrink-0 px-6 pt-4 pb-3 flex flex-col items-center">
          <DialogTitle>Tạo nhóm mới</DialogTitle>
          <DialogDescription>
            Tạo một cộng đồng mới để kết nối mọi người, chia sẻ nội dung và
            tương tác.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-6 py-4">
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                id="create-group-form"
              >
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <label className="text-sm font-medium">
                        Ảnh đại diện
                      </label>
                      <div className="relative w-24 h-24 rounded-full border-4 border-white bg-gray-200 shadow-md overflow-hidden flex items-center justify-center">
                        {avatarPreview ? (
                          <Image
                            src={avatarPreview}
                            alt="Avatar preview"
                            fill
                            loading="lazy"
                            className="object-cover"
                          />
                        ) : (
                          <UserCircle2 className="w-16 h-16 text-gray-400" />
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById('group-avatar-input')
                              ?.click()
                          }
                          className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
                        >
                          <PencilLine className="w-4 h-4 text-white" />
                          <span className="text-[11px] text-white">
                            Chọn avatar
                          </span>
                        </button>
                      </div>
                      <input
                        id="group-avatar-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                      <p className="text-[11px] text-muted-foreground text-center max-w-40">
                        Nên dùng ảnh vuông, tối thiểu 200x200px.
                      </p>
                      {avatarError && (
                        <p className="text-[11px] text-red-500 text-center max-w-40">
                          {avatarError}
                        </p>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <label className="text-sm font-medium">Ảnh cover</label>
                      <div className="relative group h-32 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                        {coverPreview ? (
                          <Image
                            src={coverPreview}
                            alt="Cover preview"
                            fill
                            loading="lazy"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <ImageIcon className="w-6 h-6" />
                            <span className="text-xs">
                              Chưa có ảnh cover — chọn ảnh để làm nổi bật nhóm
                            </span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById('group-cover-input')
                              ?.click()
                          }
                          className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <PencilLine className="w-4 h-4 text-white" />
                          <span className="text-[11px] text-white">
                            Chọn ảnh cover
                          </span>
                        </button>
                      </div>
                      <input
                        id="group-cover-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverChange}
                      />
                      {coverPreview && (
                        <button
                          type="button"
                          onClick={() => setCoverMedia(null)}
                          className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3 h-3" />
                          Bỏ chọn ảnh cover
                        </button>
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        Tỉ lệ khuyến nghị 16:9, dung lượng &lt; 5MB.
                      </p>
                    </div>
                  </div>
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
                          <FieldTitle>
                            Tên nhóm
                            <span className="text-red-500 ml-0.5">*</span>
                          </FieldTitle>
                          <InputGroup className="rounded-xl">
                            <InputGroupInput
                              id={field.name}
                              name={field.name}
                              value={value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
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
                          return {
                            message: `Tối đa ${MAX_DESCRIPTION} ký tự.`,
                          };
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
                              placeholder="Giới thiệu ngắn gọn về mục đích, nội dung và đối tượng của nhóm..."
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
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
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  </form.Field>
                </FieldGroup>

                <form.Field name="privacy">
                  {(field) => (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">
                        Quyền riêng tư
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <Select
                        value={field.state.value as GroupPrivacy}
                        onValueChange={(v) =>
                          field.handleChange(v as GroupPrivacy)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn quyền riêng tư" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={GroupPrivacy.PUBLIC}>
                            Công khai
                          </SelectItem>
                          <SelectItem value={GroupPrivacy.PRIVATE}>
                            Riêng tư
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground">
                        Công khai: mọi người có thể tìm và xem nội dung nhóm.
                        Riêng tư: chỉ thành viên mới xem được.
                      </p>
                    </div>
                  )}
                </form.Field>

                <form.Field
                  name="rules"
                  validators={{
                    onChange: ({ value }) => {
                      const count = countChars(value ?? '');
                      if (count > MAX_RULES)
                        return { message: `Tối đa ${MAX_RULES} ký tự.` };
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
                        <FieldTitle>Nội quy nhóm</FieldTitle>
                        <InputGroup className="rounded-xl">
                          <InputGroupTextarea
                            id={field.name}
                            name={field.name}
                            value={value}
                            onBlur={field.handleBlur}
                            placeholder="Đặt một vài quy tắc cơ bản để mọi người tuân thủ..."
                            onChange={(e) => field.handleChange(e.target.value)}
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
                              {count}/{MAX_RULES}
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

                <div className="h-2" />
              </form>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="shrink-0 px-6 py-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleInternalOpenChange(false)}
              disabled={isPending}
            >
              Hủy
            </Button>

            <Button type="submit" form="create-group-form" disabled={isPending}>
              {isPending ? 'Đang tạo...' : 'Tạo nhóm'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
