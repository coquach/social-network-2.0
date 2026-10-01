import type {
  ConversationDTO,
  ConversationWithParticipantsDTO,
  MessageDTO,
  UserProfile,
} from "@repo/shared";
import {
  parseSafeDate,
  formatRelativeTime,
} from "@repo/shared";
import {
  formatMessageDateLabel,
  getChatDayKey,
  formatConversationTime,
  formatMessageTimestamp,
  getChatDateMs,
} from "~/lib/chat-date-utils";

type ConversationParticipantLike = {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isOnline?: boolean;
};

type PresenceLike = {
  status?: "online" | "offline" | "away";
  lastSeen?: string | null;
};

type ChatDateValue = Date | string | number | null | undefined;
type LastSeenMapLike =
  | Map<string, string>
  | Record<string, string>
  | Array<[string, string]>
  | null
  | undefined;

const hasParticipantDetails = (
  conversation: ConversationDTO | ConversationWithParticipantsDTO,
): conversation is ConversationWithParticipantsDTO => {
  return (
    "participantDetails" in conversation &&
    Array.isArray(conversation.participantDetails)
  );
};

export const compareMessagesAscending = (a: MessageDTO, b: MessageDTO) => {
  const createdAtDiff = getChatDateMs(a.createdAt) - getChatDateMs(b.createdAt);

  if (createdAtDiff !== 0) {
    return createdAtDiff;
  }

  const updatedAtDiff = getChatDateMs(a.updatedAt) - getChatDateMs(b.updatedAt);

  if (updatedAtDiff !== 0) {
    return updatedAtDiff;
  }

  return a._id.localeCompare(b._id);
};

export const getConversationLastSeenMap = (value: LastSeenMapLike) => {
  if (!value) {
    return new Map<string, string>();
  }

  if (value instanceof Map) {
    return new Map(value);
  }

  if (Array.isArray(value)) {
    return new Map(
      value.filter(
        (entry): entry is [string, string] =>
          Array.isArray(entry) &&
          entry.length === 2 &&
          typeof entry[0] === "string" &&
          typeof entry[1] === "string",
      ),
    );
  }

  return new Map(
    Object.entries(value).filter(
      (entry): entry is [string, string] =>
        typeof entry[0] === "string" && typeof entry[1] === "string",
    ),
  );
};

export const getParticipantDisplayName = (
  participant?: ConversationParticipantLike | null,
) => {
  if (!participant) {
    return "";
  }

  if (participant.name?.trim()) {
    return participant.name.trim();
  }

  return `${participant.firstName ?? ""} ${participant.lastName ?? ""}`.trim();
};

export const getConversationParticipantDetails = (
  conversation: ConversationDTO | ConversationWithParticipantsDTO,
) => {
  if (!hasParticipantDetails(conversation)) {
    return [];
  }

  return conversation.participantDetails;
};

export const getConversationOtherUserId = (
  conversation: ConversationDTO,
  currentUserId: string | null,
) => {
  if (conversation.isGroup) {
    return null;
  }

  return (
    conversation.participants.find(
      (participantId) => participantId !== currentUserId,
    ) ?? null
  );
};

export const getConversationOtherParticipant = (
  conversation: ConversationDTO | ConversationWithParticipantsDTO,
  currentUserId: string | null,
) => {
  return (
    getConversationParticipantDetails(conversation).find(
      (participant) => participant.id !== currentUserId,
    ) ?? null
  );
};

export const getConversationName = (
  conversation: ConversationDTO,
  otherUser?: Pick<UserProfile, "firstName" | "lastName"> | ConversationParticipantLike | null,
) => {
  if (conversation.isGroup) {
    return conversation.groupName?.trim() || "Nhóm chat";
  }

  const fullName = getParticipantDisplayName(otherUser);
  return fullName || "Cuộc trò chuyện";
};

export const getConversationLastActivity = (conversation: ConversationDTO) => {
  const msgTime = conversation.lastMessage?.createdAt ? parseSafeDate(conversation.lastMessage.createdAt as any).getTime() : 0;
  const updTime = conversation.updatedAt ? parseSafeDate(conversation.updatedAt as any).getTime() : 0;
  const crtTime = conversation.createdAt ? parseSafeDate(conversation.createdAt as any).getTime() : 0;
  
  const maxTime = Math.max(msgTime, updTime, crtTime);
  if (maxTime === 0) return new Date(0);
  return new Date(maxTime);
};

export const formatTimeAgo = (value?: ChatDateValue) => {
  if (!value) return "";
  return formatRelativeTime(value as any);
};

export const getConversationPresenceSubtitle = (presence?: PresenceLike) => {
  if (!presence || presence.status === "offline") {
    const lastSeenLabel = formatTimeAgo(presence?.lastSeen);
    return lastSeenLabel && lastSeenLabel !== "Vừa xong" 
      ? `Hoạt động ${lastSeenLabel}` 
      : "Ngoại tuyến";
  }

  if (presence.status === "away") {
    return "Đang tạm vắng";
  }

  return "Đang hoạt động";
};

export const getGroupConversationSubtitle = (participantCount: number) => {
  return `${participantCount} thành viên`;
};

export const getConversationUnreadState = (
  conversation: ConversationDTO,
  currentUserId: string | null,
) => {
  if (!currentUserId || !conversation.lastMessage?._id) {
    return false;
  }

  if (conversation.lastMessage.senderId === currentUserId) {
    return false;
  }

  const lastSeenMessageId = getConversationLastSeenMap(
    conversation.lastSeenMessageId as LastSeenMapLike,
  ).get(currentUserId);

  if (lastSeenMessageId) {
    return lastSeenMessageId !== conversation.lastMessage._id;
  }

  return !conversation.lastMessage.seenBy.includes(currentUserId);
};

type MessagePreviewOptions = {
  currentUserId?: string | null;
  senderName?: string;
};

export const getMessagePreview = (
  message: MessageDTO | undefined,
  isGroup: boolean,
  otherUserName?: string,
  options?: MessagePreviewOptions,
) => {
  if (!message) {
    return isGroup
      ? 'Tạo nhóm để bắt đầu trò chuyện'
      : 'Bắt đầu cuộc trò chuyện';
  }

  const isMe = options?.currentUserId
    ? message.senderId === options.currentUserId
    : false;
    
  const senderName = isMe
    ? 'Tôi'
    : options?.senderName
      ? options.senderName
      : otherUserName || 'Người khác';

  const prefix = `${senderName}: `;

  if (message.isDeleted) {
    return `${prefix}Đã xóa tin nhắn`;
  }

  if (message.attachments?.length && !message.content?.trim()) {
    return `${prefix}Đã gửi tệp đính kèm`;
  }

  const raw = message.content?.trim() || '';
  const truncated = raw.length > 80 ? `${raw.slice(0, 80)}…` : raw;

  return `${prefix}${truncated || 'Đã gửi tin nhắn'}`;
};

export {
  formatMessageDateLabel,
  getChatDayKey,
  formatConversationTime,
  formatMessageTimestamp,
  getChatDateMs,
};
