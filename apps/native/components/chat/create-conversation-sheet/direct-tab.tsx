import type { UserDTO } from "@repo/shared";
import { Avatar } from "heroui-native/avatar";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import React from "react";
import { Controller, type Control } from "react-hook-form";
import { ScrollView, View } from "react-native";

import type { DirectConversationFormValues } from "./form";
import {
  FormErrorText,
  getUserName,
  ResultSection,
  UserResultRow,
  UserSearchField,
} from "./shared";

type CreateDirectConversationTabProps = {
  control: Control<DirectConversationFormValues>;
  directResults: UserDTO[];
  errorMessage?: string;
  hasQuery: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onRemoveUser: () => void;
  onSelectUser: (user: UserDTO) => void;
  selectedUser: UserDTO | null;
};

export function CreateDirectConversationTab({
  control,
  directResults,
  errorMessage,
  hasNextPage,
  hasQuery,
  isFetchingNextPage,
  isLoading,
  onLoadMore,
  onRemoveUser,
  onSelectUser,
  selectedUser,
}: CreateDirectConversationTabProps) {
  return (
    <ScrollView
      className="w-full"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 16, paddingBottom: 8 }}
    >
      <Controller
        control={control}
        name="directQuery"
        render={({ field }) => (
          <UserSearchField
            value={field.value}
            onChange={field.onChange}
            placeholder="Tìm người để chat"
          />
        )}
      />

      {selectedUser ? (
        <Card variant="secondary" className="rounded-[28px]">
          <Card.Body className="gap-4">
            <View className="flex-row items-center gap-3">
              <Avatar
                size="lg"
                color="accent"
                variant="soft"
                alt={getUserName(selectedUser)}
              >
                {selectedUser.avatarUrl ? (
                  <Avatar.Image source={{ uri: selectedUser.avatarUrl }} />
                ) : null}
                <Avatar.Fallback>
                  {getUserName(selectedUser).slice(0, 2).toUpperCase()}
                </Avatar.Fallback>
              </Avatar>
              <View className="flex-1">
                <Card.Title>{getUserName(selectedUser)}</Card.Title>
                <Card.Description>
                  {selectedUser.bio?.trim() ||
                    "Bạn chưa có thông tin gì về người này."}
                </Card.Description>
              </View>
            </View>
            <Button
              variant="ghost"
              className="self-start rounded-full px-3"
              onPress={onRemoveUser}
            >
              Bỏ chọn
            </Button>
          </Card.Body>
        </Card>
      ) : null}

      <ResultSection
        title="Kết quả tìm kiếm"
        users={directResults}
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
            isSelected={selectedUser?.id === user.id}
            actionLabel="Chọn"
            onPress={() => onSelectUser(user)}
          />
        )}
      />

      <FormErrorText message={errorMessage} />
    </ScrollView>
  );
}
