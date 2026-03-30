import type { ConversationDTO, MessageDTO, UserProfile } from '@repo/shared';

export const getConversationOtherUserId = (
  conversation: ConversationDTO,
  currentUserId: string | null,
) => {
  if (conversation.isGroup) {
    return null;
  }

  return conversation.participants.find((participantId) => participantId !== currentUserId) ?? null;
};

export const getConversationName = (
  conversation: ConversationDTO,
  otherUser?: Pick<UserProfile, 'firstName' | 'lastName'> | null,
) => {
  if (conversation.isGroup) {
    return conversation.groupName?.trim() || 'Nhom chat';
  }

  const fullName = `${otherUser?.firstName ?? ''} ${otherUser?.lastName ?? ''}`.trim();
  return fullName || 'Cuoc tro chuyen';
};

export const formatConversationTime = (date?: Date) => {
  if (!date) {
    return '';
  }

  const now = new Date();
  const isSameDay =
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate();

  if (isSameDay) {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
};

export const getMessagePreview = (
  message: MessageDTO | undefined,
  isGroup: boolean,
  otherUserName?: string,
) => {
  if (!message) {
    return isGroup ? 'Nhóm mới được tạo.' : 'Bắt đầu cuộc trò chuyện.';
  }

  if (message.isDeleted) {
    return 'Tin nhắn đã bị xóa.';
  }

  if (message.content?.trim()) {
    return message.content.trim();
  }

  if (message.attachments?.length) {
    return 'Đã gửi một tệp đính kèm.';
  }

  return otherUserName ? `${otherUserName} đã gửi` : 'Đã gửi một tin nhắn.';
};
