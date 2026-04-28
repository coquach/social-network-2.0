import { Ionicons } from "@expo/vector-icons";
import type { UserDTO } from "@repo/shared";
import { Card } from "heroui-native/card";
import { Input } from "heroui-native/input";
import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";
import React from "react";
import { Controller, type Control } from "react-hook-form";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { ImageSourceActions } from "~/components/ui/image-source-actions";
import type { SelectedUploadImage } from "~/lib/use-single-image-source-picker";

import type { GroupConversationFormValues } from "./form";
import {
  FormErrorText,
  ResultSection,
  SelectedUserChip,
  UserResultRow,
  UserSearchField,
} from "./shared";

type CreateGroupConversationTabProps = {
  control: Control<GroupConversationFormValues>;
  groupNameError?: string;
  groupParticipantError?: string;
  groupResults: UserDTO[];
  hasQuery: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  onAddUser: (user: UserDTO) => void;
  onClearAvatar: () => void;
  onLoadMore: () => void;
  onPickAvatar: (source: "library" | "camera") => void;
  onRemoveUser: (userId: string) => void;
  selectedAvatar: SelectedUploadImage | null;
  selectedUsers: UserDTO[];
};

export function CreateGroupConversationTab({
  control,
  groupNameError,
  groupParticipantError,
  groupResults,
  hasNextPage,
  hasQuery,
  isFetchingNextPage,
  isLoading,
  onAddUser,
  onClearAvatar,
  onLoadMore,
  onPickAvatar,
  onRemoveUser,
  selectedAvatar,
  selectedUsers,
}: CreateGroupConversationTabProps) {
  const [isAvatarSheetOpen, setIsAvatarSheetOpen] = React.useState(false);

  return (
    <ScrollView
      className="w-full"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 16, paddingBottom: 8 }}
    >
      <Card variant="secondary" className="rounded-[28px]">
        <Card.Body className="gap-4">
          <View className="items-center gap-3">
            <View className="relative">
              {selectedAvatar?.previewUri ? (
                <Image
                  source={{ uri: selectedAvatar.previewUri }}
                  className="h-28 w-28 rounded-[32px]"
                />
              ) : (
                <View className="h-28 w-28 items-center justify-center rounded-[32px] bg-app-primary/12 dark:bg-app-primary-dark/18">
                  <Ionicons name="camera-outline" size={28} color="#0ea5e9" />
                </View>
              )}
            </View>

            <View className="items-center gap-2">
              <TouchableOpacity
                onPress={() => setIsAvatarSheetOpen(true)}
                className="rounded-full bg-app-surface-elevated px-4 py-2 dark:bg-app-surface-elevated-dark"
              >
                <Text className="text-sm font-semibold text-app-fg dark:text-app-fg-dark">
                  Đổi ảnh nhóm
                </Text>
              </TouchableOpacity>
              {selectedAvatar ? (
                <TouchableOpacity onPress={onClearAvatar}>
                  <Text className="text-xs font-semibold text-rose-500">Bỏ ảnh</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <ImageSourceActions
              visible={isAvatarSheetOpen}
              onClose={() => setIsAvatarSheetOpen(false)}
              onPick={onPickAvatar}
            />
          </View>
        </Card.Body>
      </Card>

      <Controller
        control={control}
        name="groupName"
        render={({ field }) => (
          <TextField isInvalid={Boolean(groupNameError)} className="gap-2">
            <Label>
              <Label.Text className="text-sm font-semibold text-app-fg dark:text-app-fg-dark">
                Tên nhóm
              </Label.Text>
            </Label>
            <Input
              variant="secondary"
              className="min-h-14 rounded-[24px] px-4 text-base"
              placeholder="Ví dụ: Team Sentimeta"
              value={field.value}
              onChangeText={field.onChange}
            />
            <FormErrorText message={groupNameError} />
          </TextField>
        )}
      />

      {selectedUsers.length > 0 ? (
        <Card variant="secondary" className="rounded-[28px]">
          <Card.Body className="gap-3">
            <Card.Title>Thành viên đã chọn</Card.Title>
            <View className="flex-row flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <SelectedUserChip
                  key={user.id}
                  user={user}
                  onRemove={() => onRemoveUser(user.id)}
                />
              ))}
            </View>
          </Card.Body>
        </Card>
      ) : null}

      <Controller
        control={control}
        name="groupQuery"
        render={({ field }) => (
          <UserSearchField
            value={field.value}
            onChange={field.onChange}
            placeholder="Tìm người để thêm vào nhóm"
          />
        )}
      />

      <ResultSection
        title="Kết quả tìm kiếm"
        users={groupResults}
        emptyLabel="Nhập tên hoặc email để tìm người dùng."
        isLoading={isLoading}
        hasQuery={hasQuery}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        onLoadMore={onLoadMore}
        renderUser={(user) => (
          <UserResultRow
            key={user.id}
            user={user}
            isSelected={false}
            actionLabel="Thêm"
            onPress={() => onAddUser(user)}
          />
        )}
      />

      <FormErrorText message={groupParticipantError} />
    </ScrollView>
  );
}
