import { ConversationDTO } from '@/models/conversation/conversationDTO';

export const ensureLastSeenMap = (
  value?: ConversationDTO['lastSeenMessageId']
): Map<string, string> => {
  if (!value) return new Map<string, string>();

  if (value instanceof Map) {
    return new Map<string, string>(value);
  }

  // trường hợp BE trả object thuần
  const obj = value as Record<string, string>;
  return new Map<string, string>(Object.entries(obj));
};
