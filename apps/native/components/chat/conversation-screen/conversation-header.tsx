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
import { CallType } from "@repo/shared";

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
  onStartCall?: (type: CallType) => void;
  onJoinCall?: (callId: string) => void;
  onEndCall?: (callId: string, isGroup?: boolean) => void;
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
  onStartCall,
  onJoinCall,
  onEndCall,
}: ConversationHeaderProps) {
  const subtitle = conversation?.isGroup
    ? getGroupConversationSubtitle(conversation.participants.length)
    : getConversationPresenceSubtitle(presence);

  return (
    <AppHeader
      variant="bordered"
      leading={<AppBackButton />}
      trailing={
        <View className="flex-row items-center gap-1">
          {conversation?.activeCallId ? (
            <>
              <AppHeaderIconButton
                icon="call"
                variant="secondary"
                iconSize={20}
                onPress={() => onJoinCall?.(conversation.activeCallId!)}
              />
              <AppHeaderIconButton
                icon="close-circle"
                variant="secondary"
                iconSize={20}
                onPress={() => onEndCall?.(conversation.activeCallId!, conversation.isGroup)}
              />
            </>
          ) : (
            <>
              <AppHeaderIconButton
                icon="call-outline"
                variant="ghost"
                iconSize={20}
                onPress={() => onStartCall?.(CallType.AUDIO)}
              />
              <AppHeaderIconButton
                icon="videocam-outline"
                variant="ghost"
                iconSize={22}
                onPress={() => onStartCall?.(CallType.VIDEO)}
              />
            </>
          )}
          <AppHeaderIconButton
            icon="ellipsis-horizontal"
            variant="ghost"
            iconSize={18}
            onPress={onOpenDrawer}
          />
        </View>
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
            className="font-bold text-app-fg dark:text-app-fg-dark"
            style={{ fontSize: 17 }}
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
