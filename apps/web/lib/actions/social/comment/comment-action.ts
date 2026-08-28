import { getApiClient } from "@repo/shared";
import { PageResponse, Pagination } from "@repo/shared";
import {
  CommentDTO,
  CreateCommentForm,
  UpdateCommentForm,
} from "@/models/social/comment/commentDTO";
import { RootType } from "@/models/social/enums/social.enum";

export interface GetCommentsQuery extends Pagination {
  rootId?: string;
  rootType?: RootType;
  parentId?: string;
}

export const createComment = async (
  token: string,
  dto: CreateCommentForm,
): Promise<CommentDTO> => {
  try {
    const response = await getApiClient().post(`/comments`, dto, {});
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getComments = async (
  token: string,
  query: GetCommentsQuery,
): Promise<PageResponse<CommentDTO>> => {
  try {
    const response = await getApiClient().get(`/comments`, {
      params: query,
    });
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getCommentById = async (
  token: string,
  commentId: string,
): Promise<CommentDTO> => {
  try {
    const response = await getApiClient().get(`/comments/${commentId}`, {});
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateComment = async (
  token: string,
  commentId: string,
  update: UpdateCommentForm,
): Promise<CommentDTO> => {
  try {
    const response = await getApiClient().put(
      `/comments/${commentId}`,
      update,
      {},
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteComment = async (token: string, commentId: string) => {
  try {
    const response = await getApiClient().delete(`/comments/${commentId}`, {});
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
