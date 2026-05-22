import type {
  ConversationDTO,
  ConversationWithParticipantsDTO,
  MessageDTO,
  UserProfile,
} from "@repo/shared";
import {
  format,
  formatDistanceToNow,
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

const coerceChatDate = (value: ChatDateValue): Date | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    // Handle seconds vs milliseconds
    return new Date(value < 10000000000 ? value * 1000 : value);
  }

  if (typeof value === "string") {
    if (/^\d+$/.test(value)) {
      const num = parseInt(value, 10);
      return new Date(num < 10000000000 ? num * 1000 : num);
    }
  }

  if (typeof value === "object") {
    const candidate = value as {
      $date?: Date | string | number;
      date?: Date | string | number;
      toDate?: () => Date;
      seconds?: number;
      _seconds?: number;
    };

    if (typeof candidate.toDate === "function") {
      return coerceChatDate(candidate.toDate());
    }

    if (candidate.$date !== undefined) {
      return coerceChatDate(candidate.$date);
    }

    if (candidate.date !== undefined) {
      return coerceChatDate(candidate.date);
    }

    if (typeof candidate.seconds === "number") {
      return new Date(candidate.seconds * 1000);
    }

    if (typeof candidate._seconds === "number") {
      return new Date(candidate._seconds * 1000);
    }
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime()) || date.getTime() === 0) {
    return null;
  }

  return date;
};

export const getChatDateMs = (value: ChatDateValue) => {
  return coerceChatDate(value)?.getTime() ?? 0;
};

export const getChatDayKey = (value: ChatDateValue) => {
  const date = coerceChatDate(value);

  if (!date) {
    return "";
  }

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
  return (
    coerceChatDate(
      conversation.lastMessage?.createdAt ??
        conversation.updatedAt ??
        conversation.createdAt,
    ) ?? new Date(0)
  );
};

export const formatConversationTime = (value?: ChatDateValue) => {
  const date = coerceChatDate(value);

  if (!date) {
    return "";
  }

  const now = new Date();

  if (isToday(date)) {
    return "Hôm nay";
  }

  if (isYesterday(date)) {
    return "Hôm qua";
  }

  return format(date, isSameYear(date, now) ? "dd/MM" : "dd/MM/yy");
};

export const formatTimeAgo = (
  value?: ChatDateValue,
  options?: { withPrefix?: boolean },
) => {
  const date = coerceChatDate(value);

  if (!date) {
    return "";
  }

  return formatDistanceToNow(date, {
    addSuffix: options?.withPrefix ?? false,
    locale: vi,
  }).replace(/^khoảng\s+/i, "");
};

export const getConversationPresenceSubtitle = (presence?: PresenceLike) => {
  if (!presence || presence.status === "offline") {
    const lastSeenLabel = formatTimeAgo(presence?.lastSeen, {
      withPrefix: true,
    });

    return lastSeenLabel ? `Hoạt động ${lastSeenLabel}` : "Ngoại tuyến";
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
  const date = coerceChatDate(value);

  if (!date) {
    return "";
  }

  return format(date, "HH:mm");
};

export const formatMessageDateLabel = (value?: ChatDateValue) => {
  const date = coerceChatDate(value);

  if (!date) {
    return "";
  }

  if (isToday(date)) {
    return "Hôm nay";
  }

  if (isYesterday(date)) {
    return "Hôm qua";
  }

  return format(date, "EEEE, dd 'tháng' MM, yyyy", {
    locale: vi,
  });
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
