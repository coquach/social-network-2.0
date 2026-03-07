import api from '@/lib/api-client';
import {
  CursorPageResponse,
  CursorPagination,
} from '@repo/shared';
import { Audience } from '@/models/social/enums/social.enum';
import {
  CreateSharePostForm,
  SharePostDTO,
  SharePostSnapshotDTO,
  UpdateSharePostForm,
} from '@/models/social/post/sharePostDTO';

export interface GetShareQuery extends CursorPagination {
  userId?: string;
  postId?: string;
  audience?: Audience;
}

export const sharePost = async (
  token: string,
  dto: CreateSharePostForm
): Promise<SharePostDTO> => {
  try {
    const response = await api.post(`/shares`, dto, {
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

export const updateSharePost = async (
  token: string,
  shareId: string,
  dto: UpdateSharePostForm
) : Promise<SharePostDTO> => {
  try {
    const response = await api.patch(`/shares/share/${shareId}`, dto, {
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

export const deleteSharePost = async (token: string, shareId: string) => {
  try {
    const response = await api.delete(`/shares/${shareId}`, {
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

export const getShareById = async (
  token: string,
  shareId: string
): Promise<SharePostDTO> => {
  try {
    const response = await api.get(`/shares/share/${shareId}`, {
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

export const getMyShares = async (
  token: string,
  query: GetShareQuery
): Promise<CursorPageResponse<SharePostSnapshotDTO>> => {
  try {
    const response = await api.get(`/shares/me`, {
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

export const getUserShares = async (
  token: string,
  userId: string,
  query: GetShareQuery
): Promise<CursorPageResponse<SharePostSnapshotDTO>> => {
  try {
    const response = await api.get(`/shares/user/${userId}`, {
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

export const getPostShares = async (
  token: string,
  postId: string,
  query: GetShareQuery
): Promise<CursorPageResponse<SharePostSnapshotDTO>> => {
  try {
    const response = await api.get(`/shares/post/${postId}`, {
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
