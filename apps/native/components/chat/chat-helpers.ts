import type {
  ConversationDTO,
  ConversationWithParticipantsDTO,
  MessageDTO,
  UserProfile,
} from "@repo/shared";

type ConversationParticipantLike = {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isOnline?: boolean;
};

const hasParticipantDetails = (
  conversation: ConversationDTO | ConversationWithParticipantsDTO,
): conversation is ConversationWithParticipantsDTO => {
  return (
    "participantDetails" in conversation &&
    Array.isArray(conversation.participantDetails)
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

  return `${participant.lastName ?? ""} ${participant.firstName ?? ""}`.trim();
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
    return conversation.groupName?.trim() || "Nhom chat";
  }

  const fullName = getParticipantDisplayName(otherUser);
  return fullName || "Cuoc tro chuyen";
};

export const getConversationLastActivity = (conversation: ConversationDTO) => {
  return (
    conversation.lastMessage?.createdAt ??
    conversation.updatedAt ??
    conversation.createdAt
  );
};

export const formatConversationTime = (date?: Date) => {
  if (!date) {
    return "";
  }

  const now = new Date();
  const isSameDay =
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate();

  if (isSameDay) {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  const isSameYear = now.getFullYear() === date.getFullYear();

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    ...(isSameYear ? {} : { year: "2-digit" }),
  }).format(date);
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

  const lastSeenMessageId =
    conversation.lastSeenMessageId instanceof Map
      ? conversation.lastSeenMessageId.get(currentUserId)
      : undefined;

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
    return isGroup ? "Nhom moi duoc tao." : "Bat dau cuoc tro chuyen.";
  }

  const isOwnMessage = options?.currentUserId
    ? message.senderId === options.currentUserId
    : false;
  const senderPrefix = isOwnMessage
    ? "Ban: "
    : isGroup && options?.senderName
      ? `${options.senderName}: `
      : "";

  if (message.isDeleted) {
    return `${senderPrefix}Tin nhan da bi xoa.`;
  }

  if (message.content?.trim()) {
    return `${senderPrefix}${message.content.trim()}`;
  }

  if (message.attachments?.length) {
    return `${senderPrefix}Da gui tep dinh kem.`;
  }

  return otherUserName
    ? `${otherUserName} da gui tin nhan.`
    : `${senderPrefix}Da gui tin nhan.`;
};
