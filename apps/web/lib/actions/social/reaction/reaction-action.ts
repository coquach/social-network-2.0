import api from '@/lib/api-client';
import { CursorPagination, ReactionType, TargetType, CreateReactionInput, RemoveReactionInput } from '@repo/shared';

export interface GetReactionsDto extends CursorPagination {
  targetId: string;
  targetType: TargetType;
  reactionType?: ReactionType;
}

export const react = async (token: string, dto: CreateReactionInput) => {
  try {
    const response = await api.post(`/reactions`, dto, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const disReact = async (token: string, dto: RemoveReactionInput) => {
  try {
    const response = await api.delete(`/reactions`, {
      data: dto,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getReactions = async (token: string, query: GetReactionsDto) => {
  try {
    const response = await api.get(`/reactions`, {
      params: query,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
