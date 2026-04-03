import type { ConversationDTO } from "@repo/shared";
import React from "react";
import { Text, View } from "react-native";

import {
  DirectChatAvatar,
  GroupChatAvatar,
} from "~/components/chat/chat-avatar";
import {
  getConversationPresenceSubtitle,
  getGroupConversationSubtitle,
} from "~/components/chat/chat-helpers";
import {
  AppBackButton,
  AppHeader,
  AppHeaderIconButton,
} from "~/components/ui/app-header";
import { cn } from "~/lib/cn";

type PresenceLike = {
  status?: "online" | "offline" | "away";
  lastSeen?: string | null;
};

type ConversationHeaderProps = {
  conversation?: ConversationDTO | null;
  conversationName: string;
  directAvatarUrl?: string;
  presence?: PresenceLike;
  onOpenDrawer: () => void;
};

const getPresenceDotClassName = (status?: PresenceLike["status"]) => {
  if (status === "online") {
    return "bg-emerald-500";
  }

  if (status === "away") {
    return "bg-amber-400";
  }

  return "bg-slate-400";
};

export function ConversationHeader({
  conversation,
  conversationName,
  directAvatarUrl,
  presence,
  onOpenDrawer,
}: ConversationHeaderProps) {
  const subtitle = conversation?.isGroup
    ? getGroupConversationSubtitle(conversation.participants.length)
    : getConversationPresenceSubtitle(presence);

  return (
    <AppHeader
      variant="bordered"
      leading={<AppBackButton />}
      trailing={
        <AppHeaderIconButton
          icon="ellipsis-horizontal"
          variant="ghost"
          iconSize={18}
          onPress={onOpenDrawer}
        />
      }
      contentClassName="flex-row items-center gap-3"
      className="bg-app-surface dark:bg-app-surface-dark"
    >
      <View className="flex-1 flex-row items-center gap-3">
        {conversation?.isGroup ? (
          <GroupChatAvatar conversation={conversation} size="md" />
        ) : (
          <DirectChatAvatar
            name={conversationName}
            imageUrl={directAvatarUrl}
            online={presence?.status === "online"}
            size="md"
          />
        )}

        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="text-[17px] font-bold text-app-fg dark:text-app-fg-dark"
          >
            {conversationName}
          </Text>

          <View className="mt-0.5 flex-row items-center gap-1.5">
            {!conversation?.isGroup ? (
              <View
                className={cn(
                  "h-2 w-2 rounded-full",
                  getPresenceDotClassName(presence?.status),
                )}
              />
            ) : null}
            <Text
              numberOfLines={1}
              className="text-xs text-app-muted-fg dark:text-app-muted-fg-dark"
            >
              {subtitle}
            </Text>
          </View>
        </View>
      </View>
    </AppHeader>
  );
}
