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
  format,
  isSameYear,
  isToday,
  isYesterday,
} from "date-fns";
import { vi } from "date-fns/locale";

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


export const getChatDateMs = (value: ChatDateValue) => {
  if (!value) return 0;
  const parsed = parseSafeDate(value as any);
  return parsed.getTime();
};

export const getChatDayKey = (value: ChatDateValue) => {
  if (!value) return "";
  const date = parseSafeDate(value as any);
  return format(date, "yyyy-MM-dd");
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
  otherUser?:
    | Pick<UserProfile, "firstName" | "lastName">
    | ConversationParticipantLike
    | null,
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

export const formatConversationTime = (value?: ChatDateValue) => {
  if (!value) return "";
  const date = parseSafeDate(value as any);
  const now = new Date();

  if (isToday(date)) return "Hôm nay";
  if (isYesterday(date)) return "Hôm qua";

  return format(date, isSameYear(date, now) ? "dd/MM" : "dd/MM/yy");
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

export const formatMessageTimestamp = (value?: ChatDateValue) => {
  if (!value) return "";
  return format(parseSafeDate(value as any), "HH:mm");
};

export const formatMessageDateLabel = (value?: ChatDateValue) => {
  if (!value) return "";
  const date = parseSafeDate(value as any);

  if (isToday(date)) return "Hôm nay";
  if (isYesterday(date)) return "Hôm qua";

  return format(date, "EEEE, dd 'tháng' MM, yyyy", { locale: vi });
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
    return isGroup ? "Nhóm mới được tạo." : "Bắt đầu cuộc trò chuyện.";
  }

  const isOwnMessage = options?.currentUserId
    ? message.senderId === options.currentUserId
    : false;
  const senderPrefix = isOwnMessage
    ? "Bạn: "
    : isGroup && options?.senderName
      ? `${options.senderName}: `
      : "";

  if (message.isDeleted) {
    return `${senderPrefix}Tin nhắn đã bị xóa.`;
  }

  if (message.content?.trim()) {
    return `${senderPrefix}${message.content.trim()}`;
  }

  if (message.attachments?.length) {
    return `${senderPrefix}Đã gửi tệp đính kèm.`;
  }

  return otherUserName
    ? `${otherUserName} đã gửi tin nhắn.`
    : `${senderPrefix}Đã gửi tin nhắn.`;
};
