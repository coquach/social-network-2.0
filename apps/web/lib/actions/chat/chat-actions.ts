import { getApiClient } from "@repo/shared";
import { CursorPageResponse, CursorPagination } from "@repo/shared";
import {
  ConversationDTO,
  CreateConversationForm,
  UpdateConversationForm,
} from "@/models/conversation/conversationDTO";
import { CreateMessageForm, MessageDTO } from "@/models/message/messageDTO";

export const getConversationList = async (
  token: string,
  query: CursorPagination,
): Promise<CursorPageResponse<ConversationDTO>> => {
  try {
    const response = await getApiClient().get<
      CursorPageResponse<ConversationDTO>
    >("/chats/conversations", {
      params: query,
    });
    return response as any;
  } catch (error) {
    throw error;
  }
};

export const getConversationById = async (
  token: string,
  conversationId: string,
): Promise<ConversationDTO> => {
  try {
    const response = await getApiClient().get<ConversationDTO>(
      `/chats/conversations/${conversationId}`,
      {},
    );
    return response as any;
  } catch (error) {
    throw error;
  }
};

export const getMessagesByConversationId = async (
  token: string,
  conversationId: string,
  query: CursorPagination,
): Promise<CursorPageResponse<MessageDTO>> => {
  try {
    const response = await getApiClient().get<CursorPageResponse<MessageDTO>>(
      `/chats/conversations/${conversationId}/messages`,
      {
        params: query,
      },
    );
    return response as any;
  } catch (error) {
    throw error;
  }
};

export const createConversation = async (
  token: string,
  dto: CreateConversationForm,
): Promise<ConversationDTO> => {
  try {
    const response = await getApiClient().post("/chats/conversations", dto, {});
    return response as any;
  } catch (error) {
    throw error;
  }
};

export const updateConversation = async (
  token: string,
  conversationId: string,
  dto: UpdateConversationForm,
) => {
  try {
    const response = await getApiClient().put(
      `/chats/conversations/${conversationId}`,

      dto,
      {},
    );
    return response as any;
  } catch (error) {
    throw error;
  }
};

export const deleteConversation = async (
  token: string,
  conversationId: string,
) => {
  try {
    const response = await getApiClient().delete(
      `/chats/conversations/${conversationId}`,
      {},
    );
    return response as any;
  } catch (error) {
    throw error;
  }
};

export const hideConversationForUser = async (
  token: string,
  conversationId: string,
) => {
  try {
    const response = await getApiClient().post(
      `/chats/conversations/${conversationId}/hide`,
      {},
      {},
    );
    return response as any;
  } catch (error) {
    throw error;
  }
};

export const unhideConversationForUser = async (
  token: string,
  conversationId: string,
) => {
  try {
    const response = await getApiClient().post(
      `/chats/conversations/${conversationId}/unhide`,
      {},
      {},
    );
    return response as any;
  } catch (error) {
    throw error;
  }
};

export const leaveConversationForUser = async (
  token: string,
  conversationId: string,
) => {
  try {
    const response = await getApiClient().post(
      `/chats/conversations/${conversationId}/leave`,
      {},
      {},
    );
    return response as any;
  } catch (error) {
    throw error;
  }
};

export const markConversationAsRead = async (
  token: string,
  conversationId: string,
  lastMessageId?: string,
) => {
  try {
    const response = await getApiClient().post(
      `/chats/conversations/${conversationId}/read`,
      {
        lastMessageId,
      },
      {},
    );
    return response as any;
  } catch (error) {
    throw error;
  }
};

export const sendMessage = async (
  token: string,
  dto: CreateMessageForm,
): Promise<MessageDTO> => {
  try {
    const response = await getApiClient().post("/chats/messages", dto, {});
    return response as any;
  } catch (error) {
    throw error;
  }
};
export const deleteMessage = async (token: string, messageId: string) => {
  try {
    const response = await getApiClient().delete(
      `/chats/messages/${messageId}`,
      {},
    );
    return response as any;
  } catch (error) {
    throw error;
  }
};
