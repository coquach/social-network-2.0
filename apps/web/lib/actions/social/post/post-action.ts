import api from '@/lib/api-client';
import {
  CursorPageResponse,
  CursorPagination,
} from '@repo/shared';
import { Emotion, PostGroupStatus } from '@/models/social/enums/social.enum';
import {
  CreatePostForm,
  EditHistoryDTO,
  PostDTO,
  PostSnapshotDTO,
  UpdatePostForm,
} from '@/models/social/post/postDTO';

export interface GetPostQuery extends CursorPagination {
  feeling?: Emotion;
}

export const getPost = async (
  token: string,
  postId: string
): Promise<PostDTO> => {
  try {
    const response = await api.get<PostDTO>(`/posts/post/${postId}`, {
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

export const getMyPosts = async (
  token: string,
  query: GetPostQuery
): Promise<CursorPageResponse<PostSnapshotDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<PostSnapshotDTO>>(
      `/posts/me`,
      {
        params: query,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getPostsByUser = async (
  token: string,
  userId: string,
  query: GetPostQuery
): Promise<CursorPageResponse<PostSnapshotDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<PostSnapshotDTO>>(
      `/posts/user/${userId}`,
      {
        params: query,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export interface GetGroupPostQueryDTO extends CursorPagination {
  mainEmotion?: Emotion;
  status?: PostGroupStatus;
}

export const getPostsByGroup = async (
  token: string,
  groupId: string,
  query: GetGroupPostQueryDTO
): Promise<CursorPageResponse<PostSnapshotDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<PostSnapshotDTO>>(
      `/posts/group/${groupId}`,
      {
        params: query,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createPost = async (
  token: string,
  data: CreatePostForm
): Promise<PostSnapshotDTO> => {
  try {
    const response = await api.post(`/posts`, data, {
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

export const createPostInGroup = async (
  token: string,
  data: CreatePostForm
): Promise<{
  post: PostSnapshotDTO;
  status: PostGroupStatus;
  message: string;
}> => {
  try {
    const response = await api.post(`/posts/group`, data, {
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

export const updatePost = async (
  token: string,
  postId: string,
  data: UpdatePostForm
): Promise<PostSnapshotDTO> => {
  try {
    const response = await api.patch(`/posts/update/${postId}`, data, {
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

export const approvePostInGroup = async (
  token: string,
  postId: string
): Promise<boolean> => {
  try {
    const response = await api.post(`/posts/group/approve/${postId}`, {}, {
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

export const rejectPostInGroup = async (
  token: string,
  postId: string
): Promise<boolean> => {
  try {
    const response = await api.post(`/posts/group/reject/${postId}`, {}, {
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

export const removePost = async (
  token: string,
  postId: string
): Promise<boolean> => {
  try {
    const response = await api.delete(`/posts/delete/${postId}`, {
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

export const getPostEditHistory = async (
  token: string,
  postId: string
): Promise<EditHistoryDTO[]> => {
  try {
    const response = await api.get<EditHistoryDTO[]>(
      `/posts/post/${postId}/edit-histories`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
  catch (error) {
    console.error(error);
    throw error;
  }
}