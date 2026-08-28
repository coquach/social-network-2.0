import { getApiClient } from "@repo/shared";
import { CursorPagination } from "@repo/shared";
import { ReactionType, TargetType } from "@/models/social/enums/social.enum";
import {
  CreateReactionForm,
  DisReactionForm,
} from "@/models/social/reaction/reactionDTO";

export interface GetReactionsDto extends CursorPagination {
  targetId: string;
  targetType: TargetType;
  reactionType?: ReactionType;
}

export const react = async (token: string, dto: CreateReactionForm) => {
  try {
    const response = await getApiClient().post(`/reactions`, dto, {});
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const disReact = async (token: string, dto: DisReactionForm) => {
  try {
    const response = await getApiClient().delete(`/reactions`, {
      data: dto,
    });
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getReactions = async (token: string, query: GetReactionsDto) => {
  try {
    const response = await getApiClient().get(`/reactions`, {
      params: query,
    });
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
