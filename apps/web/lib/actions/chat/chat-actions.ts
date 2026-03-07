import api from '@/lib/api-client';
import {
  CursorPageResponse,
  CursorPagination,
} from '@repo/shared';
import {
  ConversationDTO,
  CreateConversationForm,
  UpdateConversationForm,
} from '@/models/conversation/conversationDTO';
import { CreateMessageForm, MessageDTO } from '@/models/message/messageDTO';

export const getConversationList = async (
  token: string,
  query: CursorPagination
): Promise<CursorPageResponse<ConversationDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<ConversationDTO>>(
      '/chats/conversations',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: query,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getConversationById = async (
  token: string,
  conversationId: string
): Promise<ConversationDTO> => {
  try {
    const response = await api.get<ConversationDTO>(
      `/chats/conversations/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMessagesByConversationId = async (
  token: string,
  conversationId: string,
  query: CursorPagination
): Promise<CursorPageResponse<MessageDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<MessageDTO>>(
      `/chats/conversations/${conversationId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: query,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createConversation = async (
  token: string,
  dto: CreateConversationForm
): Promise<ConversationDTO> => {
  try {
    const response = await api.post('/chats/conversations', dto, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateConversation = async (
  token: string,
  conversationId: string,
  dto: UpdateConversationForm
) => {
  try {
    const response = await api.put(
      `/chats/conversations/${conversationId}`,

      dto,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteConversation = async (
  token: string,
  conversationId: string
) => {
  try {
    const response = await api.delete(
      `/chats/conversations/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const hideConversationForUser = async (
  token: string,
  conversationId: string
) => {
  try {
    const response = await api.post(
      `/chats/conversations/${conversationId}/hide`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const unhideConversationForUser = async (
  token: string,
  conversationId: string
) => {
  try {
    const response = await api.post(
      `/chats/conversations/${conversationId}/unhide`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const leaveConversationForUser = async (
  token: string,
  conversationId: string
) => {
  try {
    const response = await api.post(
      `/chats/conversations/${conversationId}/leave`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
  catch (error) {
    throw error;
  }
};

export const markConversationAsRead = async (
  token: string,
  conversationId: string,
  lastMessageId?: string
) => {
  try {
    const response = await api.post(
      `/chats/conversations/${conversationId}/read`,
      {
        lastMessageId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const sendMessage = async (
  token: string,
  dto: CreateMessageForm
): Promise<MessageDTO> => {
  try {
    const response = await api.post('/chats/messages', dto, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
export const deleteMessage = async (
  token: string,
  messageId: string
) => {
  try {
    const response = await api.delete(`/chats/messages/${messageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
  catch (error) {
    throw error;
  }
};