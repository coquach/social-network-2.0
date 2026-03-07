'use client';

import { useCreateComment } from '@/hooks/user-comment-hook';
import { MediaItem } from '@/lib/types/media';
import { cn } from '@/lib/utils';
import {
  CommentSchema,
  CreateCommentForm,
} from '@/models/social/comment/commentDTO';
import { MediaType, RootType } from '@/models/social/enums/social.enum';
import { useAuth } from '@clerk/nextjs';
import { useForm } from '@tanstack/react-form';
import {
  Image as ImageIcon,
  SendHorizonal,
  Video as VideoIcon,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { MediumAvatar } from '../avatar';
import { EmojiButton } from '../emoji-button';
import { Button } from '../ui/button';

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup
} from '@/components/ui/field';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';

interface CommentInputProps {
  rootId: string;
  rootType: RootType;
  parentId?: string;
  placeholder?: string;
  /** max height của vùng text+media */
  maxContentHeight?: number; // px
}

const MAX_COMMENT = 100; // bạn đổi theo schema nếu cần

export const CommentInput = ({
  rootId,
  rootType,
  parentId,
  placeholder = 'Viết bình luận...',
  maxContentHeight = 150,
}: CommentInputProps) => {
  const uid = useId();
  const textareaId = `comment-content-${uid}`;
  const imgInputId = `comment-image-${uid}`;
  const videoInputId = `comment-video-${uid}`;

  const { userId } = useAuth();
  const [media, setMedia] = useState<MediaItem | undefined>(undefined);

  const imgInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const preview = useMemo(
    () => (media ? URL.createObjectURL(media.file) : null),
    [media]
  );
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const { mutateAsync: createComment, isPending } = useCreateComment(rootId);

  const form = useForm({
    defaultValues: {
      rootId,
      rootType,
      parentId,
      content: '',
    } satisfies CreateCommentForm,

    validators: {
      onSubmit: ({ value }) => {
        const result = CommentSchema.safeParse(value);
        if (result.success) return undefined;
        return result.error.issues.map((i) => i.message);
      },
    },

    onSubmit: async ({ value }) => {
      const promise = createComment(
        {
          data: {
            rootId: value.rootId,
            rootType: value.rootType,
            parentId: value.parentId,
            content: value.content.trim(),
          },
          media,
        },
        {
          onSuccess: () => {
            form.reset({
              rootId,
              rootType,
              parentId,
              content: '',
            });
            setMedia(undefined);

            if (imgInputRef.current) imgInputRef.current.value = '';
            if (videoInputRef.current) videoInputRef.current.value = '';
          },
        }
      );

      toast.promise(promise, { loading: 'Đang đăng bình luận...' });
      await promise;
    },
  });

  // Sync khi đổi root/parent (giống pattern report/post)
  useEffect(() => {
    form.reset({
      rootId,
      rootType,
      parentId,
      content: '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootId, rootType, parentId]);



  return (
    <form
      className="flex items-start gap-2 w-full"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <MediumAvatar userId={userId as string} hasBorder />

      <div className="flex-1 min-w-0">
        <>
          {/* vùng Text + Media ONLY (overflow ở đây) */}
          <div
            className={cn('px-2 pt-2', 'overflow-y-auto')}
            style={{ maxHeight: maxContentHeight }}
          >
            <FieldGroup>
              <form.Field name="content">
                {(field) => {
                  const value = (field.state.value ?? '') as string;

                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <InputGroup className="rounded-x">
                        <InputGroupTextarea
                          id={textareaId}
                          name={field.name}
                          value={value}
                          placeholder={placeholder}
                          disabled={isPending}
                          rows={1}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={cn(
                            'w-full bg-transparent outline-none text-sm text-gray-800 min-h-8',
                            'resize-none',
                            'whitespace-pre-wrap wrap-break-word p-2'
                          )}
                          aria-invalid={isInvalid}
                        />

                        <InputGroupAddon align="block-end">
                          <InputGroupText className="tabular-nums">
                            {value.length}/{MAX_COMMENT}
                          </InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                      <FieldDescription className="text-xs">
                        Bạn có thể đính kèm 1 ảnh hoặc 1 video.
                      </FieldDescription>

                      {/* Preview nằm trong Field để đi cùng content */}
                      {preview && (
                        <div className="mt-2 relative rounded-xl border border-gray-200 bg-white p-2">
                          {media?.type === MediaType.IMAGE ? (
                            <Image
                              src={preview}
                              alt="preview"
                              width={220}
                              height={220}
                              loading="lazy"
                              className="rounded-lg object-cover max-h-56 w-auto"
                            />
                          ) : (
                            <video
                              src={preview}
                              controls
                              className="rounded-lg w-full max-h-56 object-cover"
                            />
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setMedia(undefined);
                              if (imgInputRef.current)
                                imgInputRef.current.value = '';
                              if (videoInputRef.current)
                                videoInputRef.current.value = '';
                            }}
                            className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 hover:bg-black/70 transition"
                            aria-label="Remove media"
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>
          </div>

          {/*  action bar nằm NGOÀI vùng overflow */}
          <div className="mt-2 flex items-center justify-between px-2 pb-1 ">
            <div className="flex items-center gap-1.5">
              <label
                htmlFor={imgInputId}
                className="h-9 w-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer transition"
                title="Ảnh"
              >
                <ImageIcon size={18} />
              </label>
              <input
                ref={imgInputRef}
                id={imgInputId}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setMedia({ file, type: MediaType.IMAGE });
                }}
              />

              <label
                htmlFor={videoInputId}
                className="h-9 w-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer transition"
                title="Video"
              >
                <VideoIcon size={18} />
              </label>
              <input
                ref={videoInputRef}
                id={videoInputId}
                type="file"
                accept="video/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setMedia({ file, type: MediaType.VIDEO });
                }}
              />

              <EmojiButton
                disabled={isPending}
                popupSide="top"
                align="left"
                onPick={(emoji) => {
                  const current = form.state.values.content ?? '';
                  form.setFieldValue('content', current + emoji);
                  const el = document.getElementById(
                    textareaId
                  ) as HTMLTextAreaElement | null;
                  el?.focus();
                }}
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className={cn(
                'h-8 w-8 p-0 rounded-full',
                'bg-sky-500 hover:bg-sky-600 text-white',
                'disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:bg-gray-200'
              )}
              aria-label="Send comment"
              title="Gửi"
            >
              <SendHorizonal size={16} />
            </Button>
          </div>
        </>
      </div>
    </form>
  );
};
