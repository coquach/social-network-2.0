import { Ionicons } from '@expo/vector-icons';
import {
  type UserDTO,
  useCreateConversation,
  useCurrentUser,
  useFriendUsers,
} from '@repo/shared';
import { router } from 'expo-router';
import { Button } from 'heroui-native/button';
import { Tabs } from 'heroui-native/tabs';
import { useToast } from 'heroui-native/toast';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { View } from 'react-native';

import { AppBottomSheet } from '~/components/ui/app-bottom-sheet';
import { AppToast, type AppToastData } from '~/components/ui/app-toast';
import { useSingleImageSourcePicker } from '~/lib/use-single-image-source-picker';

import { CreateDirectConversationTab } from './create-conversation-sheet/direct-tab';
import {
  createSchemaResolver,
  directConversationFormSchema,
  groupConversationFormSchema,
  type DirectConversationFormValues,
  type GroupConversationFormValues,
} from './create-conversation-sheet/form';
import { CreateGroupConversationTab } from './create-conversation-sheet/group-tab';
import {
  getFieldErrorMessage,
  getUserName,
  SEARCH_LIMIT,
} from './create-conversation-sheet/shared';

type CreateConversationSheetProps = {
  visible: boolean;
  onClose: () => void;
};

type ConversationTab = 'direct' | 'group';

export function CreateConversationSheet({
  visible,
  onClose,
}: CreateConversationSheetProps) {
  const { toast } = useToast();
  const { data: currentUser } = useCurrentUser();
  const { mutateAsync: createConversation, isPending } =
    useCreateConversation();
  const [activeTab, setActiveTab] = React.useState<ConversationTab>('direct');
  const [selectedDirectUser, setSelectedDirectUser] =
    React.useState<UserDTO | null>(null);
  const [selectedGroupUsers, setSelectedGroupUsers] = React.useState<UserDTO[]>(
    [],
  );
  const {
    selectedImage: selectedAvatar,
    pickImage: pickAvatar,
    clearImage: clearAvatar,
  } = useSingleImageSourcePicker({
    fileNamePrefix: 'conversation-avatar',
    permissionAlert: {
      title: 'Cần quyền truy cập',
      cameraMessage: 'Hãy cho phép camera để chụp ảnh.',
      libraryMessage: 'Hãy cho phép thư viện ảnh để chọn ảnh.',
    },
  });

  const directForm = useForm<DirectConversationFormValues>({
    defaultValues: {
      isGroup: false,
      participants: [],
      directQuery: '',
    },
    resolver: createSchemaResolver(directConversationFormSchema),
    reValidateMode: 'onChange',
  });

  const groupForm = useForm<GroupConversationFormValues>({
    defaultValues: {
      isGroup: true,
      participants: [],
      groupName: '',
      groupQuery: '',
    },
    resolver: createSchemaResolver(groupConversationFormSchema),
    reValidateMode: 'onChange',
  });

  const directQuery = useWatch({
    control: directForm.control,
    name: 'directQuery',
  });
  const groupQuery = useWatch({
    control: groupForm.control,
    name: 'groupQuery',
  });

  const deferredDirectQuery = React.useDeferredValue(directQuery.trim());
  const deferredGroupQuery = React.useDeferredValue(groupQuery.trim());

  const directSearch = useFriendUsers(currentUser?.id ?? '', {
    search: deferredDirectQuery,
    limit: SEARCH_LIMIT,
  });
  const groupSearch = useFriendUsers(currentUser?.id ?? '', {
    search: deferredGroupQuery,
    limit: SEARCH_LIMIT,
  });

  const directResults = React.useMemo(() => {
    const items = directSearch.data?.pages.flatMap((page) => page.data) ?? [];
    return items.filter((user) => user.id !== currentUser?.id);
  }, [currentUser?.id, directSearch.data?.pages]);

  const groupResults = React.useMemo(() => {
    const items = groupSearch.data?.pages.flatMap((page) => page.data) ?? [];
    return items.filter(
      (user) =>
        user.id !== currentUser?.id &&
        !selectedGroupUsers.some((selected) => selected.id === user.id),
    );
  }, [currentUser?.id, groupSearch.data?.pages, selectedGroupUsers]);

  const showToast = React.useCallback(
    (value: AppToastData) => {
      toast.show({
        component: (toastProps) => (
          <AppToast toast={value} toastProps={toastProps} />
        ),
      });
    },
    [toast],
  );

  const resetState = React.useCallback(() => {
    directForm.reset();
    groupForm.reset();
    setActiveTab('direct');
    setSelectedDirectUser(null);
    setSelectedGroupUsers([]);
    clearAvatar();
  }, [clearAvatar, directForm, groupForm]);

  const handleDismiss = React.useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const handleSelectDirectUser = React.useCallback(
    (user: UserDTO) => {
      setSelectedDirectUser(user);
      directForm.setValue('participants', [user.id], {
        shouldDirty: true,
        shouldValidate: true,
      });
      directForm.setValue('directQuery', '', {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [directForm],
  );

  const handleRemoveDirectUser = React.useCallback(() => {
    setSelectedDirectUser(null);
    directForm.setValue('participants', [], {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [directForm]);

  const handleAddGroupUser = React.useCallback(
    (user: UserDTO) => {
      const nextUsers = [...selectedGroupUsers, user];

      setSelectedGroupUsers(nextUsers);
      groupForm.setValue(
        'participants',
        nextUsers.map((item) => item.id),
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );
      groupForm.setValue('groupQuery', '', {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [groupForm, selectedGroupUsers],
  );

  const handleRemoveGroupUser = React.useCallback(
    (userId: string) => {
      const nextUsers = selectedGroupUsers.filter((user) => user.id !== userId);

      setSelectedGroupUsers(nextUsers);
      groupForm.setValue(
        'participants',
        nextUsers.map((item) => item.id),
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );
    },
    [groupForm, selectedGroupUsers],
  );

  const submitDirectConversation = directForm.handleSubmit(async (values) => {
    try {
      const conversation = await createConversation({
        isGroup: values.isGroup,
        participants: values.participants,
      });

      showToast({
        title: 'Đã tạo cuộc trò chuyện',
        message: `Đang mở chat với ${selectedDirectUser ? getUserName(selectedDirectUser) : 'người dùng đã chọn'}.`,
        variant: 'success',
      });
      handleDismiss();
      router.push(`/chat/${conversation._id}`);
    } catch (error) {
      showToast({
        title: 'Không thể tạo cuộc trò chuyện',
        message: error instanceof Error ? error.message : 'Đã xảy ra lỗi.',
        variant: 'error',
      });
    }
  });

  const submitGroupConversation = groupForm.handleSubmit(async (values) => {
    try {
      const conversation = await createConversation({
        isGroup: values.isGroup,
        groupName: values.groupName,
        participants: values.participants,
        uploadGroupAvatar: selectedAvatar?.uploadFile,
      });

      showToast({
        title: 'Đã tạo nhóm chat',
        message: `Nhóm ${values.groupName} đã được tạo thành công.`,
        variant: 'success',
      });
      handleDismiss();
      router.push(`/chat/${conversation._id}`);
    } catch (error) {
      showToast({
        title: 'Không thể tạo nhóm chat',
        message: error instanceof Error ? error.message : 'Đã xảy ra lỗi.',
        variant: 'error',
      });
    }
  });

  return (
    <AppBottomSheet
      visible={visible}
      onClose={handleDismiss}
      title="Tạo cuộc trò chuyện mới"
      description="Bắt đầu một cuộc trò chuyện mới với một người hoặc tạo nhóm chat với nhiều người cùng lúc."
      titleClassName="text-center"
      descriptionClassName="text-center"
      bodyClassName="mt-4"
      androidKeyboardInputMode="adjustResize"
      footer={
        <View className="flex-row gap-3">
          <Button
            variant="primary"
            className="min-h-12 flex-1 rounded-[22px]"
            isDisabled={isPending}
            onPress={() => {
              if (activeTab === 'direct') {
                void submitDirectConversation();
                return;
              }

              void submitGroupConversation();
            }}
          >
            {isPending
              ? 'Đang xử lý...'
              : activeTab === 'direct'
                ? 'Bắt đầu chat'
                : 'Tạo nhóm chat'}
          </Button>
          <Button
            variant="secondary"
            className="min-h-12 flex-1 rounded-[22px]"
            onPress={handleDismiss}
          >
            Đóng
          </Button>
        </View>
      }
    >
      <View className="w-full gap-4">
        <Tabs
          value={activeTab}
          variant="primary"
          className="w-full"
          onValueChange={(value) => setActiveTab(value as ConversationTab)}
        >
          <Tabs.List className="w-full rounded-[24px] bg-app-surface-elevated p-1 dark:bg-app-surface-elevated-dark">
            <Tabs.Indicator />
            <Tabs.Trigger value="direct" className="flex-1">
              <Ionicons name="paper-plane-outline" size={16} color="#0ea5e9" />
              <Tabs.Label>Trực tiếp</Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="group" className="flex-1">
              <Ionicons name="people-outline" size={16} color="#0ea5e9" />
              <Tabs.Label>Nhóm</Tabs.Label>
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="direct" className="w-full pt-4">
            <CreateDirectConversationTab
              control={directForm.control}
              directResults={directResults}
              errorMessage={getFieldErrorMessage(
                directForm.formState.errors.participants,
              )}
              hasQuery={deferredDirectQuery.length > 0}
              hasNextPage={directSearch.hasNextPage}
              isFetchingNextPage={directSearch.isFetchingNextPage}
              isLoading={directSearch.isLoading}
              onLoadMore={() => {
                void directSearch.fetchNextPage();
              }}
              onRemoveUser={handleRemoveDirectUser}
              onSelectUser={handleSelectDirectUser}
              selectedUser={selectedDirectUser}
            />
          </Tabs.Content>

          <Tabs.Content value="group" className="w-full pt-4">
            <CreateGroupConversationTab
              control={groupForm.control}
              groupNameError={getFieldErrorMessage(
                groupForm.formState.errors.groupName,
              )}
              groupParticipantError={getFieldErrorMessage(
                groupForm.formState.errors.participants,
              )}
              groupResults={groupResults}
              hasQuery={deferredGroupQuery.length > 0}
              hasNextPage={groupSearch.hasNextPage}
              isFetchingNextPage={groupSearch.isFetchingNextPage}
              isLoading={groupSearch.isLoading}
              onAddUser={handleAddGroupUser}
              onClearAvatar={clearAvatar}
              onLoadMore={() => {
                void groupSearch.fetchNextPage();
              }}
              onPickAvatar={(source) => {
                void pickAvatar(source);
              }}
              onRemoveUser={handleRemoveGroupUser}
              selectedAvatar={selectedAvatar}
              selectedUsers={selectedGroupUsers}
            />
          </Tabs.Content>
        </Tabs>
      </View>
    </AppBottomSheet>
  );
}
