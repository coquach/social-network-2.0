import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, View } from "react-native";

import {
  DirectChatAvatar,
  GroupChatAvatar,
} from "~/components/chat/chat-avatar";
import { Button } from "heroui-native/button";
import { cn } from "~/lib/cn";

type ParticipantInfo = {
  id: string;
  name?: string;
  avatarUrl?: string;
};

export function SheetSection({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <View className="flex-row items-end justify-between">
        <Text className="text-base font-semibold text-app-fg dark:text-app-fg-dark">
          {title}
        </Text>
        {caption ? (
          <Text className="text-xs text-app-muted-fg dark:text-app-muted-fg-dark">
            {caption}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function HeroMetric({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View className="min-w-[104px] flex-1 rounded-[22px] border border-app-border bg-app-surface-elevated px-4 py-3 dark:border-app-border-dark dark:bg-app-surface-elevated-dark">
      <View className="flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-500/15">
          <Ionicons name={icon} size={16} color="#0ea5e9" />
        </View>
        <Text
          numberOfLines={1}
          className="flex-1 font-semibold text-app-fg dark:text-app-fg-dark"
          style={{ fontSize: 15 }}
        >
          {value}
        </Text>
      </View>
      <Text
        numberOfLines={1}
        className="mt-2 text-app-muted-fg dark:text-app-muted-fg-dark"
        style={{ fontSize: 12 }}
      >
        {label}
      </Text>
    </View>
  );
}

export function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-[22px] border border-app-border bg-app-surface-elevated px-4 py-3 dark:border-app-border-dark dark:bg-app-surface-elevated-dark">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-500/15">
        <Ionicons name={icon} size={18} color="#0ea5e9" />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-xs text-app-muted-fg dark:text-app-muted-fg-dark">
          {label}
        </Text>
        <Text
          numberOfLines={2}
          className="mt-0.5 font-semibold text-app-fg dark:text-app-fg-dark"
          style={{ fontSize: 15 }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

export function ActionRow({
  label,
  icon,
  destructive = false,
  disabled = false,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "min-h-14 w-full justify-start rounded-[22px] border px-4 shadow-none",
        destructive
          ? "border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10"
          : "border-app-border bg-app-surface-elevated dark:border-app-border-dark dark:bg-app-surface-elevated-dark",
      )}
      isDisabled={disabled}
      onPress={onPress}
    >
      <View
        className={cn(
          "h-9 w-9 items-center justify-center rounded-full",
          destructive
            ? "bg-rose-100 dark:bg-rose-500/20"
            : "bg-sky-100 dark:bg-sky-500/15",
        )}
      >
        <Ionicons
          name={icon}
          size={18}
          color={destructive ? "#e11d48" : "#0ea5e9"}
        />
      </View>
      <Button.Label
        className={cn(
          "ml-3 text-[15px] font-semibold",
          destructive
            ? "text-rose-600 dark:text-rose-300"
            : "text-app-fg dark:text-app-fg-dark",
        )}
      >
        {label}
      </Button.Label>
    </Button>
  );
}

export function MemberListRow({
  member,
  isAdmin,
  isCurrentUser,
}: {
  member: ParticipantInfo;
  isAdmin: boolean;
  isCurrentUser: boolean;
}) {
  const memberName = member.name?.trim() || "Người dùng";

  return (
    <View className="flex-row items-center gap-3 rounded-[22px] border border-app-border bg-app-surface-elevated px-3 py-3 dark:border-app-border-dark dark:bg-app-surface-elevated-dark">
      <DirectChatAvatar name={memberName} imageUrl={member.avatarUrl} size="sm" />
      <View className="min-w-0 flex-1">
        <Text
          numberOfLines={1}
          className="font-semibold text-app-fg dark:text-app-fg-dark"
          style={{ fontSize: 15 }}
        >
          {memberName}
        </Text>
        <Text
          numberOfLines={1}
          className="mt-0.5 text-xs text-app-muted-fg dark:text-app-muted-fg-dark"
        >
          {isCurrentUser
            ? isAdmin
              ? "Bạn · Quản trị viên"
              : "Bạn · Thành viên"
            : isAdmin
              ? "Quản trị viên"
              : "Thành viên"}
        </Text>
      </View>
    </View>
  );
}

export function ConversationHero({
  isGroup,
  conversationName,
  subtitle,
  directAvatarUrl,
  online,
  groupConversation,
  groupPreviewUri,
  tertiaryText,
}: {
  isGroup: boolean;
  conversationName: string;
  subtitle: string;
  directAvatarUrl?: string;
  online?: boolean;
  groupConversation?: unknown;
  groupPreviewUri?: string;
  tertiaryText?: string;
}) {
  return (
    <View className="items-center px-2 pt-1">
      {isGroup ? (
        groupPreviewUri ? (
          <Image source={{ uri: groupPreviewUri }} className="h-24 w-24 rounded-[30px]" />
        ) : (
          <GroupChatAvatar conversation={groupConversation as never} size="lg" />
        )
      ) : (
        <DirectChatAvatar
          name={conversationName}
          imageUrl={directAvatarUrl}
          online={online}
          size="lg"
        />
      )}

      <Text className="mt-4 text-center text-2xl font-extrabold text-app-fg dark:text-app-fg-dark">
        {conversationName}
      </Text>
      <Text className="mt-1 text-center text-sm leading-6 text-app-muted-fg dark:text-app-muted-fg-dark">
        {subtitle}
      </Text>
      {tertiaryText ? (
        <Text className="mt-2 text-center text-xs text-app-muted-fg dark:text-app-muted-fg-dark">
          {tertiaryText}
        </Text>
      ) : null}
    </View>
  );
}
