import type {
  ConversationDTO,
  ConversationWithParticipantsDTO,
} from "@repo/shared";
import React from "react";
import { ScrollView, Text, View } from "react-native";

import {
  DirectChatAvatar,
  GroupChatAvatar,
} from "~/components/chat/chat-avatar";
import {
  getConversationPresenceSubtitle,
  getGroupConversationSubtitle,
  getParticipantDisplayName,
} from "~/components/chat/chat-helpers";
import { AppCard } from "~/components/ui/app-card";
import { AppBottomSheet } from "~/components/ui/app-bottom-sheet";

type PresenceLike = {
  status?: "online" | "offline" | "away";
  lastSeen?: string | null;
};

type ParticipantInfo = {
  id: string;
  name?: string;
  avatarUrl?: string;
};

const hasParticipantDetails = (
  conversation?: ConversationDTO | ConversationWithParticipantsDTO | null,
): conversation is ConversationWithParticipantsDTO => {
  return Array.isArray(
    (conversation as ConversationWithParticipantsDTO | null | undefined)
      ?.participantDetails,
  );
};

type ConversationInfoSheetProps = {
  visible: boolean;
  onClose: () => void;
  conversation?: ConversationDTO | ConversationWithParticipantsDTO | null;
  conversationName: string;
  currentUserId?: string | null;
  directAvatarUrl?: string;
  presence?: PresenceLike;
};

function ParticipantRow({
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
    <View className="flex-row items-center gap-3 rounded-[24px] border border-app-border bg-app-surface px-3 py-3 dark:border-app-border-dark dark:bg-app-surface-dark">
      <DirectChatAvatar name={memberName} imageUrl={member.avatarUrl} size="sm" />

      <View className="flex-1">
        <Text
          numberOfLines={1}
          className="text-[15px] font-semibold text-app-fg dark:text-app-fg-dark"
        >
          {isCurrentUser ? `${memberName} (Bạn)` : memberName}
        </Text>
        <Text className="mt-0.5 text-xs text-app-muted-fg dark:text-app-muted-fg-dark">
          {isAdmin ? "Quản trị viên" : "Thành viên"}
        </Text>
      </View>
    </View>
  );
}

export function ConversationInfoSheet({
  visible,
  onClose,
  conversation,
  conversationName,
  currentUserId,
  directAvatarUrl,
  presence,
}: ConversationInfoSheetProps) {
  const members = React.useMemo(() => {
    if (!hasParticipantDetails(conversation)) {
      return [];
    }

    return conversation.participantDetails.map((member) => ({
      id: member.id,
      name: getParticipantDisplayName(member),
      avatarUrl: member.avatarUrl,
    }));
  }, [conversation]);

  const description = conversation?.isGroup
    ? getGroupConversationSubtitle(conversation.participants.length)
    : getConversationPresenceSubtitle(presence);

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      title="Thông tin cuộc trò chuyện"
      description="Xem nhanh thành viên và trạng thái hiện tại."
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingBottom: 8 }}
      >
        <AppCard className="rounded-[28px] px-5 py-5">
          <View className="items-center">
            {conversation?.isGroup ? (
              <GroupChatAvatar conversation={conversation} size="lg" />
            ) : (
              <DirectChatAvatar
                name={conversationName}
                imageUrl={directAvatarUrl}
                online={presence?.status === "online"}
                size="lg"
              />
            )}

            <Text className="mt-4 text-center text-lg font-bold text-app-fg dark:text-app-fg-dark">
              {conversationName}
            </Text>
            <Text className="mt-1 text-center text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
              {description}
            </Text>
          </View>
        </AppCard>

        {conversation?.isGroup ? (
          <AppCard className="rounded-[28px] px-4 py-4">
            <Text className="text-sm font-semibold text-app-fg dark:text-app-fg-dark">
              Thành viên
            </Text>
            <View className="mt-3 gap-2.5">
              {members.map((member) => (
                <ParticipantRow
                  key={member.id}
                  member={member}
                  isAdmin={Boolean(conversation.admins.includes(member.id))}
                  isCurrentUser={member.id === currentUserId}
                />
              ))}
            </View>
          </AppCard>
        ) : (
          <AppCard className="rounded-[28px] px-4 py-4">
            <Text className="text-sm font-semibold text-app-fg dark:text-app-fg-dark">
              Trạng thái
            </Text>
            <Text className="mt-2 text-sm leading-6 text-app-muted-fg dark:text-app-muted-fg-dark">
              {getConversationPresenceSubtitle(presence)}
            </Text>
          </AppCard>
        )}
      </ScrollView>
    </AppBottomSheet>
  );
}
