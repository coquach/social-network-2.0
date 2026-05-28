import type {
  ConversationDTO,
  ConversationWithParticipantsDTO,
  CursorPageResponse,
  MessageDTO,
} from '../types';

type DateLike = Date | string | number | null | undefined;

type RawMessageDTO = Omit<MessageDTO, 'createdAt' | 'updatedAt' | 'deletedAt' | 'replyTo'> & {
  createdAt: DateLike;
  updatedAt: DateLike;
  deletedAt?: DateLike;
  replyTo?: RawMessageDTO | null;
};

type RawConversationDTO = Omit<
  ConversationWithParticipantsDTO,
  'createdAt' | 'updatedAt' | 'lastSeenMessageId' | 'lastMessage'
> & {
  createdAt: DateLike;
  updatedAt?: DateLike;
  lastSeenMessageId?:
    | Map<string, string>
    | Record<string, string>
    | Array<[string, string]>
    | null;
  lastMessage?: RawMessageDTO | null;
};

const DEFAULT_DATE = new Date(0);

const normalizeDate = (value: DateLike): Date => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return DEFAULT_DATE;
};

const normalizeOptionalDate = (value: DateLike): Date | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  return normalizeDate(value);
};

const normalizeLastSeenMap = (
  value: RawConversationDTO['lastSeenMessageId']
): Map<string, string> | undefined => {
  if (!value) {
    return undefined;
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
          typeof entry[0] === 'string' &&
          typeof entry[1] === 'string'
      )
    );
  }

  return new Map(
    Object.entries(value).filter(
      (entry): entry is [string, string] =>
        typeof entry[0] === 'string' && typeof entry[1] === 'string'
    )
  );
};

export const normalizeMessage = (message: RawMessageDTO): MessageDTO => {
  return {
    ...message,
    createdAt: normalizeDate(message.createdAt),
    updatedAt: normalizeDate(message.updatedAt),
    deletedAt: normalizeOptionalDate(message.deletedAt),
    replyTo: message.replyTo ? normalizeMessage(message.replyTo) : undefined,
  };
};

export const normalizeConversation = (
  conversation: RawConversationDTO
): ConversationWithParticipantsDTO => {
  return {
    ...conversation,
    createdAt: normalizeDate(conversation.createdAt),
    updatedAt: normalizeOptionalDate(conversation.updatedAt),
    lastSeenMessageId: normalizeLastSeenMap(conversation.lastSeenMessageId),
    lastMessage: conversation.lastMessage
      ? normalizeMessage(conversation.lastMessage)
      : undefined,
  };
};

export const normalizeConversationPage = (
  page: CursorPageResponse<RawConversationDTO>
): CursorPageResponse<ConversationDTO> => {
  return {
    ...page,
    data: page.data.map(normalizeConversation),
  };
};

export const normalizeMessagePage = (
  page: CursorPageResponse<RawMessageDTO>
): CursorPageResponse<MessageDTO> => {
  return {
    ...page,
    data: page.data.map(normalizeMessage),
  };
};
