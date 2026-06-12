import { Ionicons } from "@expo/vector-icons";
import type { UserDTO } from "@repo/shared";
import { Avatar } from "heroui-native/avatar";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { FieldError as HeroFieldError } from "heroui-native/field-error";
import { SearchField } from "heroui-native/search-field";
import React from "react";
import { Text, View } from "react-native";

import { cn } from "~/lib/cn";

export const SEARCH_LIMIT = 8;

export const getUserName = (user: Pick<UserDTO, "firstName" | "lastName">) =>
  `${user.firstName} ${user.lastName}`.trim() || "Người dùng";

export function getFieldErrorMessage(error?: { message?: unknown }) {
  return typeof error?.message === "string" ? error.message : undefined;
}

export function UserSearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <SearchField value={value} onChange={onChange}>
      <SearchField.Group className="rounded-[26px] border border-white/70 bg-white/92 dark:border-app-border-dark dark:bg-app-surface-dark/92">
        <SearchField.SearchIcon iconProps={{ color: "#0ea5e9", size: 18 }} />
        <SearchField.Input
          variant="secondary"
          placeholder={placeholder}
          className="min-h-12 rounded-[26px] bg-transparent flex-1 px-10"
        />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}

export function FormErrorText({ message }: { message?: string }) {
  return (
    <HeroFieldError isInvalid={Boolean(message)} className="min-h-5">
      {message}
    </HeroFieldError>
  );
}

export function UserResultRow({
  user,
  isSelected,
  onPress,
  actionLabel,
}: {
  user: UserDTO;
  isSelected: boolean;
  onPress: () => void;
  actionLabel: string;
}) {
  const name = getUserName(user);
  const subtitle = user.bio?.trim() || user.email;

  return (
    <Button
      variant="ghost"
      className="min-h-16 justify-start rounded-[22px] px-3"
      onPress={onPress}
    >
      <Avatar size="md" color="accent" variant="soft" alt={name}>
        {user.avatarUrl ? (
          <Avatar.Image source={{ uri: user.avatarUrl }} />
        ) : null}
        <Avatar.Fallback>{name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar>
      <View className="ml-3 flex-1">
        <Text
          numberOfLines={1}
          className="text-left text-[15px] font-semibold text-app-fg dark:text-app-fg-dark"
        >
          {name}
        </Text>
        <Text
          numberOfLines={1}
          className="mt-1 text-left text-[13px] text-app-muted-fg dark:text-app-muted-fg-dark"
        >
          {subtitle}
        </Text>
      </View>
      <View
        className={cn(
          "ml-2 rounded-full px-3 py-1",
          isSelected
            ? "bg-app-primary/15 dark:bg-app-primary-dark/20"
            : "bg-app-surface-elevated dark:bg-app-surface-elevated-dark",
        )}
      >
        <Text
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.8px]",
            isSelected
              ? "text-app-primary dark:text-app-primary-dark"
              : "text-app-muted-fg dark:text-app-muted-fg-dark",
          )}
        >
          {isSelected ? "Đã chọn" : actionLabel}
        </Text>
      </View>
    </Button>
  );
}

export function SelectedUserChip({
  user,
  onRemove,
}: {
  user: UserDTO;
  onRemove: () => void;
}) {
  const name = getUserName(user);

  return (
    <Button
      variant="secondary"
      size="sm"
      className="rounded-full px-3 shadow-none"
      onPress={onRemove}
    >
      <Avatar size="sm" color="accent" variant="soft" alt={name}>
        {user.avatarUrl ? (
          <Avatar.Image source={{ uri: user.avatarUrl }} />
        ) : null}
        <Avatar.Fallback>{name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar>
      <Button.Label>{name}</Button.Label>
      <Ionicons name="close" size={14} color="#64748b" />
    </Button>
  );
}

export function ResultSection({
  title,
  users,
  emptyLabel,
  isLoading,
  hasQuery,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  renderUser,
}: {
  title: string;
  users: UserDTO[];
  emptyLabel: string;
  isLoading: boolean;
  hasQuery: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  onLoadMore: () => void;
  renderUser: (user: UserDTO) => React.ReactNode;
}) {
  return (
    <Card
      variant="secondary"
      className="rounded-[28px] border border-app-border bg-app-surface shadow-none dark:border-app-border-dark dark:bg-app-surface-dark"
    >
      <Card.Body className="gap-3">
        <View className="flex-row items-center justify-between">
          <Card.Title className="text-base">{title}</Card.Title>
          {isFetchingNextPage ? (
            <Text className="text-[11px] font-semibold uppercase tracking-[0.8px] text-app-primary dark:text-app-primary-dark">
              Đang tải...
            </Text>
          ) : null}
        </View>

        {!hasQuery ? (
          <Card.Description className="text-app-surface">{emptyLabel}</Card.Description>
        ) : isLoading ? (
          <Card.Description>Đang tìm người dùng...</Card.Description>
        ) : users.length === 0 ? (
          <Card.Description>Không tìm thấy kết quả phù hợp.</Card.Description>
        ) : (
          <View className="gap-2">
            {users.map((user) => renderUser(user))}
            {hasNextPage ? (
              <Button
                variant="ghost"
                className="rounded-[20px]"
                onPress={onLoadMore}
              >
                Tải thêm
              </Button>
            ) : null}
          </View>
        )}
      </Card.Body>
    </Card>
  );
}
