import api from '@/lib/api-client';
import { CursorPagination } from '@repo/shared';
import { ReactionType, TargetType } from '@/models/social/enums/social.enum';
import {
  CreateReactionForm,
  DisReactionForm,
} from '@/models/social/reaction/reactionDTO';

export interface GetReactionsDto extends CursorPagination {
  targetId: string;
  targetType: TargetType;
  reactionType?: ReactionType;
}

export const react = async (token: string, dto: CreateReactionForm) => {
  try {
    const response = await api.post(`/reactions/react`, dto, {
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

export const disReact = async (token: string, dto: DisReactionForm) => {
  try {
    const response = await api.delete(`/reactions/dis-react`,{
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

export const getReactions = async (
  token: string,
  query: GetReactionsDto
) => {
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
}
