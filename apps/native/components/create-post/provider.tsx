import { useToast } from 'heroui-native/toast';
import React from 'react';
import {
  Audience,
  Emotion,
  feelingMap,
  type UploadableFile,
  useCreatePost,
  useCreatePostInGroup,
  useCurrentUser,
} from '@repo/shared';

import { AppToast } from '~/components/ui/app-toast';

import { countChars } from '~/utils/count-chars';
import { CreatePostContextProvider } from './context';
import type {
  ComposerMediaItem,
  CreatePostProviderProps,
  CreatePostView,
} from './types';

const MAX_MEDIA = 5;
const MAX_WORDS = 2000;

export function CreatePostProvider({
  children,
  placeholder = 'Bạn đang nghĩ gì?',
  groupId,
  isPrivacyChangeable = true,
  autoFocusInput = false,
  maxLength = MAX_WORDS,
}: CreatePostProviderProps) {
  const { toast } = useToast();
  const { data: currentUser } = useCurrentUser();
  const createPostMutation = useCreatePost();
  const createPostInGroupMutation = useCreatePostInGroup();

  const [content, setContent] = React.useState('');
  const [audience, setAudience] = React.useState<Audience>(Audience.PUBLIC);
  const [feeling, setFeeling] = React.useState<Emotion | undefined>();
  const [openFeeling, setOpenFeeling] = React.useState(false);
  const [view, setView] = React.useState<CreatePostView>('composer');
  const [media, setMedia] = React.useState<ComposerMediaItem[]>([]);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const isPending = groupId
    ? createPostInGroupMutation.isPending
    : createPostMutation.isPending;

  const selectedFeeling = React.useMemo(() => {
    return feeling ? (feelingMap.get(feeling) ?? null) : null;
  }, [feeling]);

  const displayName = React.useMemo(() => {
    const firstName = currentUser?.firstName?.trim() ?? '';
    const lastName = currentUser?.lastName?.trim() ?? '';
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName.length > 0) {
      return fullName;
    }

    return 'Bạn';
  }, [currentUser?.firstName, currentUser?.lastName]);

  const charCount = React.useMemo(() => countChars(content), [content]);

  const addMedia = React.useCallback(
    (items: ComposerMediaItem[]) => {
      let accepted = true;

      setMedia((previous) => {
        if (previous.length + items.length > MAX_MEDIA) {
          accepted = false;
          return previous;
        }

        return [...previous, ...items];
      });

      if (!accepted) {
        toast.show({
          duration: 2800,
          component: (toastProps) => (
            <AppToast
              toast={{
                title: 'Quá số lượng tệp',
                message: `Bạn chỉ có thể thêm tối đa ${MAX_MEDIA} tệp.`,
                variant: 'warning',
              }}
              toastProps={toastProps}
            />
          ),
        });
      }

      return accepted;
    },
    [toast],
  );

  const removeMedia = React.useCallback((key: string) => {
    setMedia((previous) => previous.filter((item) => item.key !== key));
  }, []);

  const clearForm = React.useCallback(() => {
    setContent('');
    setAudience(Audience.PUBLIC);
    setFeeling(undefined);
    setOpenFeeling(false);
    setView('composer');
    setMedia([]);
    setErrorMessage(null);
  }, []);

  const openAudienceSelector = React.useCallback(() => {
    setView('audience');
  }, []);

  const closeAudienceSelector = React.useCallback(() => {
    setView('composer');
  }, []);

  const appendContent = React.useCallback((text: string) => {
    setContent((previous) => `${previous}${text}`);
  }, []);

  const submit = React.useCallback(async () => {
    const trimmed = content.trim();
    const trimmedCount = countChars(trimmed);

    if (trimmedCount < 1) {
      setErrorMessage('Nội dung bài viết không được để trống.');
      return false;
    }

    if (trimmedCount > maxLength) {
      setErrorMessage(`Tối đa ${maxLength} kí tự.`);
      return false;
    }

    setErrorMessage(null);

    const uploadFiles: UploadableFile[] = media.map((item) => ({
      file: item.file,
      type: item.type,
      previewUri: item.preview,
    }));

    try {
      if (groupId) {
        await createPostInGroupMutation.mutateAsync({
          content: trimmed,
          audience,
          feeling,
          groupId,
          uploadFiles,
        });
      } else {
        await createPostMutation.mutateAsync({
          content: trimmed,
          audience,
          feeling,
          groupId,
          uploadFiles,
        });
      }

      clearForm();

      toast.show({
        duration: 2200,
        component: (toastProps) => (
          <AppToast
            toast={{
              title: 'Đăng bài thành công',
              message: 'Bài viết của bạn đã được tạo.',
              variant: 'success',
            }}
            toastProps={toastProps}
          />
        ),
      });

      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Đăng bài thất bại. Vui lòng thử lại.';

      setErrorMessage(message);

      toast.show({
        duration: 3000,
        component: (toastProps) => (
          <AppToast
            toast={{
              title: 'Không thể đăng bài',
              message,
              variant: 'error',
            }}
            toastProps={toastProps}
          />
        ),
      });

      return false;
    }
  }, [
    audience,
    clearForm,
    content,
    createPostInGroupMutation,
    createPostMutation,
    feeling,
    groupId,
    maxLength,
    media,
    toast,
  ]);

  const isSubmitDisabled = isPending || countChars(content.trim()) < 1;

  const contextValue = React.useMemo(
    () => ({
      content,
      setContent,
      audience,
      setAudience,
      media,
      previews: media,
      addMedia,
      removeMedia,
      feeling,
      setFeeling,
      selectedFeeling,
      openFeeling,
      setOpenFeeling,
      view,
      setView,
      openAudienceSelector,
      closeAudienceSelector,
      appendContent,
      submit,
      clearForm,
      errorMessage,
      isPending,
      isSubmitDisabled,
      userId: currentUser?.id ?? '',
      avatarUrl: currentUser?.avatarUrl ?? null,
      displayName,
      groupId,
      isPrivacyChangeable,
      placeholder,
      autoFocusInput,
      maxWords: MAX_WORDS,
      maxMedia: MAX_MEDIA,
      maxLength,
      charCount,
    }),
    [
      addMedia,
      appendContent,
      audience,
      autoFocusInput,
      charCount,
      clearForm,
      content,
      currentUser?.avatarUrl,
      currentUser?.id,
      displayName,
      errorMessage,
      feeling,
      groupId,
      isPending,
      isPrivacyChangeable,
      isSubmitDisabled,
      maxLength,
      media,
      openFeeling,
      view,
      placeholder,
      removeMedia,
      selectedFeeling,
      submit,
      openAudienceSelector,
      closeAudienceSelector,
      setView,
    ],
  );

  return (
    <CreatePostContextProvider value={contextValue}>
      {children}
    </CreatePostContextProvider>
  );
}
