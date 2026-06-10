import api from '@/lib/api-client';
import { PageResponse, Pagination, CommentDTO, CreateCommentInput, UpdateCommentInput, RootType } from '@repo/shared';

export interface GetCommentsQuery extends Pagination {
  rootId?: string;
  rootType?: RootType;
  parentId?: string;
}

export const createComment = async (token: string, dto: CreateCommentInput) : Promise<CommentDTO> => {
  try {
    const response = await api.post(`/comments`, dto, {
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

export const getComments = async (token: string, query: GetCommentsQuery) : Promise<PageResponse<CommentDTO>>=> {
  try {
    const response = await api.get(`/comments`, {
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

export const getCommentById = async (token: string, commentId: string) : Promise<CommentDTO> => {
  try {
    const response = await api.get(`/comments/${commentId}`, {
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

export const updateComment = async (
  token: string,
  commentId: string,
  update: UpdateCommentInput
) : Promise<CommentDTO> => {
  try {
    const response = await api.put(`/comments/${commentId}`, update, {
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


export const deleteComment = async (token: string, commentId: string) => {
  try {
    const response = await api.delete(`/comments/${commentId}`, {
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
