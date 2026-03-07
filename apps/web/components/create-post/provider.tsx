'use client';

import { useAuth } from '@clerk/nextjs';
import { useForm } from '@tanstack/react-form';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useCreatePost } from '@/hooks/use-post-hook';
import { feelingMap } from '@/lib/types/feeling';
import { MediaItem } from '@/lib/types/media';
import { LiveRegion } from '@/components/ui/live-region';

import {
  Audience,
  Emotion,
  MediaType,
} from '@/models/social/enums/social.enum';
import { CreatePostForm, PostSchema } from '@/models/social/post/postDTO';

import { CreatePostContext } from './context';
import { CreatePostProps } from './types';

const MAX_MEDIA = 5;
const MAX_WORDS = 2000;

const EMPTY_MEDIA: MediaItem[] = [];

// Hoisted constants to prevent re-renders
const getDefaultFormValues = (groupId?: string): CreatePostForm => ({
  content: '',
  audience: Audience.PUBLIC as Audience,
  feeling: undefined as Emotion | undefined,
  groupId,
});

/**
 * CreatePost Provider - manages form state, media, and submission logic
 */
export const CreatePostProvider = ({
  placeholder = 'Bạn đang nghĩ gì?',
  groupId,
  isPrivacyChangeable = true,
  children,
}: CreatePostProps) => {
  const { userId } = useAuth();

  const [media, setMedia] = useState<MediaItem[]>(EMPTY_MEDIA);
  const [previews, setPreviews] = useState<
    { key: string; file: File; type: MediaType; preview: string }[]
  >([]);
  const previewMapRef = useRef(new Map<string, string>());

  const [openFeeling, setOpenFeeling] = useState(false);

  const { mutateAsync: createPost, isPending } = useCreatePost();

  const defaultFormValues = useMemo(
    () => getDefaultFormValues(groupId),
    [groupId]
  );

  const form = useForm({
    defaultValues: defaultFormValues,

    validators: {
      onSubmit: ({ value }) => {
        const r = PostSchema.safeParse(value);
        if (r.success) return undefined;
        return r.error.issues.map((i) => i.message);
      },
    },

    onSubmit: async ({ value }) => {
      const promise = createPost(
        {
          form: {
            content: value.content.trim(),
            audience: value.audience,
            feeling: value.feeling,
            groupId: value.groupId,
          },
          media,
        },
        {
          onSuccess: () => {
            form.reset(getDefaultFormValues(groupId));
            setMedia(() => EMPTY_MEDIA);
          },
        }
      );

      toast.promise(promise, { loading: 'Đang đăng bài...' });
      await promise;
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

    setPreviews(() => next);

    Array.from(map.entries()).forEach(([key, url]) => {
      if (!activeKeys.has(key)) {
        URL.revokeObjectURL(url);
        map.delete(key);
      }
    });
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

  // Extract primitive to narrow useMemo dependency
  const feeling = form.state.values.feeling;
  const selectedFeeling = useMemo(() => {
    return feelingMap.get(feeling as Emotion) ?? null;
  }, [feeling]);

  const handleSubmit = useCallback(() => {
    form.handleSubmit();
  }, [form]);

  const contextValue = useMemo(
    () => ({
      form,
      media,
      setMedia,
      previews,
      openFeeling,
      setOpenFeeling,
      selectedFeeling,
      isPending,
      handleSubmit,
      groupId,
      isPrivacyChangeable,
      placeholder,
      userId: userId as string,
      maxMedia: MAX_MEDIA,
      maxWords: MAX_WORDS,
    }),
    [
      form,
      media,
      previews,
      openFeeling,
      selectedFeeling,
      isPending,
      handleSubmit,
      groupId,
      isPrivacyChangeable,
      placeholder,
      userId,
    ]
  );

  return (
    <CreatePostContext.Provider value={contextValue}>
      <LiveRegion 
        message={isPending ? 'Đang đăng bài...' : ''} 
        politeness="polite"
      />
      {children}
    </CreatePostContext.Provider>
  );
};
