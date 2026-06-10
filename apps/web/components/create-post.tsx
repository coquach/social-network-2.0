'use client';

import { useAuth } from '@clerk/nextjs';
import { useForm } from '@tanstack/react-form';
import { ImageIcon, VideoIcon, X } from '@/lib/icons';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TbMoodPlus } from 'react-icons/tb';
import { toast } from 'sonner';

import { AudienceSelect } from '@/components/audience-select';
import { CreatePostAvatar } from '@/components/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useClickOutside } from '@/hooks/use-click-outside';

import {
  Field,
  FieldError,
  FieldGroup,
} from '@/components/ui/field';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';

import {
  useCreatePost,
  useCreatePostInGroup,
  Audience,
  Emotion,
  MediaType,
  PostGroupStatus,
  CreatePostInput,
  CreatePostInputSchema,
} from '@repo/shared';
import { feelingMap } from '@/lib/types/feeling';
import { MediaItem } from '@/lib/types/media';
import { cn } from '@/lib/utils';
import { countChars } from '@/utils/count-chars';

import { EmojiButton } from './emoji-button';
import { FeelingPopover } from './feeling-hover-popup';

interface CreatePostProps {
  placeholder?: string;
  groupId?: string;
  isPrivacyChangeable?: boolean;
}

const MAX_MEDIA = 5;
const MAX_WORDS = 2000;

// Hoisted constants to prevent re-renders
const getDefaultFormValues = (groupId?: string): CreatePostInput => ({
  content: '',
  audience: Audience.PUBLIC as Audience,
  feeling: undefined as Emotion | undefined,
  groupId,
});

const EMPTY_MEDIA: MediaItem[] = [];

export const CreatePost = ({
  placeholder = 'Bạn đang nghĩ gì?',
  groupId,
  isPrivacyChangeable = true,
}: CreatePostProps) => {
  const { userId } = useAuth();

  const [media, setMedia] = useState<MediaItem[]>(EMPTY_MEDIA);
  const [previews, setPreviews] = useState<
    { key: string; file: File; type: MediaType; preview: string }[]
  >([]);
  const previewMapRef = useRef(new Map<string, string>());

  const [openFeeling, setOpenFeeling] = useState(false);
  const feelingWrapRef = useRef<HTMLDivElement>(null!);
  const feelingButtonRef = useRef<HTMLButtonElement>(null!);

  const createPostMutation = useCreatePost();
  const createGroupPostMutation = useCreatePostInGroup();

  const isPending = createPostMutation.isPending || createGroupPostMutation.isPending;

  const defaultFormValues = useMemo(
    () => getDefaultFormValues(groupId),
    [groupId]
  );

  const form = useForm({
    defaultValues: defaultFormValues,

    validators: {
      onSubmit: ({ value }) => {
        const r = CreatePostInputSchema.safeParse(value);
        if (r.success) return undefined;
        return r.error.issues.map((i) => i.message);
      },
    },

    onSubmit: async ({ value }) => {
      const input = {
        content: value.content.trim(),
        audience: value.audience,
        feeling: value.feeling,
        groupId: value.groupId,
        uploadFiles: media,
      };

      const promise = value.groupId
        ? createGroupPostMutation.mutateAsync(input).then((res) => {
            if (res.status === PostGroupStatus.PUBLISHED) {
              toast.success('Đăng bài trong nhóm thành công!');
            } else {
              toast.success('Bài đăng đã được gửi và chờ duyệt bởi quản trị viên nhóm.');
            }
            return res.post;
          })
        : createPostMutation.mutateAsync(input).then((res) => {
            toast.success('Đăng bài thành công!');
            return res;
          });

      toast.promise(promise, { loading: 'Đang đăng bài...' });
      
      try {
        await promise;
        form.reset(getDefaultFormValues(groupId));
        setMedia(EMPTY_MEDIA);
      } catch (error) {
        // Error handled by toast/mutation
      }
    },
  });

  // ---- Media previews ----
  useEffect(() => {
    const map = previewMapRef.current;
    const activeKeys = new Set<string>();

    const next = media.map((item) => {
      const key = `${item.file.name}-${item.file.lastModified}-${item.file.size}`;
      activeKeys.add(key);
      let url = map.get(key);
      if (!url) {
        url = URL.createObjectURL(item.file);
        map.set(key, url);
      }
      return { ...item, key, preview: url };
    });

    setPreviews(next);

    for (const [key, url] of Array.from(map.entries())) {
      if (!activeKeys.has(key)) {
        URL.revokeObjectURL(url);
        map.delete(key);
      }
    }
  }, [media]);

  useEffect(() => {
    const map = previewMapRef.current;
    return () => {
      Array.from(map.values()).forEach((url) => {
        URL.revokeObjectURL(url);
      });
      map.clear();
    };
  }, []);

  const handleFiles = useCallback((files: File[], type: MediaType) => {
    const mapped = files.map((file) => ({ file, type }));
    setMedia((prev) => {
      const total = prev.length + mapped.length;
      if (total > MAX_MEDIA) {
        toast.error(`Bạn không thể tải nhiều hơn ${MAX_MEDIA} tệp.`);
        return prev;
      }
      return [...prev, ...mapped];
    });
  }, []);

  // ---- Close feeling popup on outside click ----
  useClickOutside(feelingWrapRef, () => setOpenFeeling(false), openFeeling);

  // Extract primitive to narrow useMemo dependency
  const feeling = form.state.values.feeling;
  const selectedFeeling = useMemo(() => {
    return feelingMap.get(feeling as Emotion) ?? null;
  }, [feeling]);


  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Card className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <CreatePostAvatar userId={userId as string} showName={!!groupId} />

          {isPrivacyChangeable && (
            <form.Field name="audience">
              {(field) => (
                <AudienceSelect
                  value={field.state.value as Audience}
                  onChange={(value) => field.handleChange(value as Audience)}
                />
              )}
            </form.Field>
          )}

          {selectedFeeling && (
            <div className="text-sm text-neutral-400 flex items-center gap-1">
              <span>đang cảm thấy</span>
              <span className="text-base">{selectedFeeling.emoji}</span>
              <span className="font-medium text-neutral-500">
                {selectedFeeling.name}
              </span>
            </div>
          )}
        </div>

        {/* Content - InputGroup giống CreateReportModal */}
        <FieldGroup>
          <form.Field
            name="content"
            validators={{
              // ✅ UI-only limit: chặn quá dài
              onChange: ({ value }) => {
                const wc = countChars(value ?? '');
                if (wc > MAX_WORDS)
                  return { message: `Tối đa ${MAX_WORDS} kí tụ.` };
                return undefined;
              },
            }}
          >
            {(field) => {
              const value = (field.state.value ?? '') as string;
              const wordCount = countChars(value);

              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <InputGroup className="rounded-xl">
                    <InputGroupTextarea
                      id={field.name}
                      name={field.name}
                      value={value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={placeholder}
                      rows={5}
                      disabled={isPending}
                      aria-invalid={isInvalid}
                      className={cn(
                        'max-h-40 resize-none overflow-y-auto min-h-10',
                        'whitespace-pre-wrap wrap-break-word'
                      )}
                    />

                    <InputGroupAddon align="block-end">
                      <InputGroupText
                        className={cn(
                          'tabular-nums',
                          isInvalid && 'text-red-600'
                        )}
                      >
                        {wordCount}/{MAX_WORDS} kí tự
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>

                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>

        {/* Media preview */}
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2 rounded-xl bg-gray-50 p-2">
            {previews.map((item) => (
              <div key={item.key} className="relative group">
                {item.type === MediaType.IMAGE ? (
                  <Image
                    src={item.preview}
                    alt=""
                    height={96}
                    width={96}
                    className="rounded-xl object-cover h-24 w-24"
                  />
                ) : (
                  <video
                    src={item.preview}
                    className="rounded-xl object-cover h-24 w-24"
                  />
                )}

                <button
                  type="button"
                  onClick={() =>
                    setMedia((prev) =>
                      prev.filter(
                        (entry) =>
                          `${entry.file.name}-${entry.file.lastModified}-${entry.file.size}` !==
                          item.key
                      )
                    )
                  }
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-1 hidden group-hover:flex"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-3 gap-2">
          <div className="flex items-center gap-3">
            {/* Images */}
            <label
              htmlFor="images"
              className="h-9 w-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer transition"
              title="Ảnh"
            >
              <ImageIcon className="size-5 text-gray-600" />
            </label>
            <input
              type="file"
              id="images"
              accept="image/*"
              hidden
              multiple
              onChange={(e) => {
                if (!e.target.files) return;
                handleFiles(Array.from(e.target.files), MediaType.IMAGE);
              }}
            />

            {/* Videos */}
            <label
              htmlFor="videos"
              className="h-9 w-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer transition"
              title="Video"
            >
              <VideoIcon className="size-5 text-gray-600" />
            </label>
            <input
              type="file"
              id="videos"
              accept="video/*"
              hidden
              multiple
              onChange={(e) => {
                if (!e.target.files) return;
                handleFiles(Array.from(e.target.files), MediaType.VIDEO);
              }}
            />

            {/* Emoji */}
            <EmojiButton
              disabled={isPending}
              popupSide="bottom"
              align="center"
              onPick={(emoji) => {
                const current = form.state.values.content ?? '';
                form.setFieldValue('content', current + emoji);

                // focus textarea (id = field.name = "content")
                const el = document.getElementById(
                  'content'
                ) as HTMLTextAreaElement | null;
                el?.focus();
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Feeling */}
        
            <FeelingPopover
              open={openFeeling}
              onOpenChange={setOpenFeeling}
              selectedFeeling={selectedFeeling}
              onSelect={(f) => {
                form.setFieldValue('feeling', f?.type ?? undefined);
              }}
              side="top" // ✅ 'top' | 'bottom'
            >
              <button
                type="button"
                ref={feelingButtonRef}
                className="h-9 w-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer transition"
                title="Cảm xúc"
              >
                <TbMoodPlus className="h-5 w-5 text-gray-600" />
              </button>
            </FeelingPopover>
            <Button
              type="submit"
              disabled={isPending}
              className={cn(
                'disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:bg-gray-200'
              )}
            >
              Đăng
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
};

CreatePost.Skeleton = function SkeletonCreatePost() {
  return (
    <Card className="w-full bg-white p-6 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
    </Card>
  );
};
