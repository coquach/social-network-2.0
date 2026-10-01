import api from '@/lib/api-client';
import {
  CursorPageResponse,
  CursorPagination,
  Emotion,
  PostGroupStatus,
  CreatePostInput,
  EditHistoryDTO,
  PostDTO,
  PostSnapshotDTO,
  UpdatePostInput,
} from '@repo/shared';

export interface GetPostQuery extends CursorPagination {
  feeling?: Emotion;
}

export type GroupPostModerationAction = 'approve' | 'reject';

export const getPost = async (
  token: string,
  postId: string,
): Promise<PostDTO> => {
  try {
    const response = await api.get<PostDTO>(`/posts/${postId}`, {
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
  query: GetPostQuery,
): Promise<CursorPageResponse<PostSnapshotDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<PostSnapshotDTO>>(
      `/posts/me`,
      {
        params: query,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
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
  query: GetPostQuery,
): Promise<CursorPageResponse<PostSnapshotDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<PostSnapshotDTO>>(
      `/posts/user/${userId}`,
      {
        params: query,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
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
  query: GetGroupPostQueryDTO,
): Promise<CursorPageResponse<PostSnapshotDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<PostSnapshotDTO>>(
      `/groups/${groupId}/posts`,
      {
        params: query,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createPost = async (
  token: string,
  data: CreatePostInput,
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
  data: CreatePostInput,
): Promise<{
  post: PostSnapshotDTO;
  status: PostGroupStatus;
  message: string;
}> => {
  try {
    const groupId = data.groupId;
    const response = await api.post(`/groups/${groupId}/posts`, data, {
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
  data: UpdatePostInput,
): Promise<PostSnapshotDTO> => {
  try {
    const response = await api.patch(`/posts/${postId}`, data, {
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

export const approvePostInGroup = (
  token: string,
  groupId: string,
  postId: string,
) => {
  return moderatePostInGroup(token, groupId, postId, 'approve');
};

export const rejectPostInGroup = (
  token: string,
  groupId: string,
  postId: string,
) => {
  return moderatePostInGroup(token, groupId, postId, 'reject');
};

export const removePost = async (
  token: string,
  postId: string,
): Promise<boolean> => {
  try {
    const response = await api.delete(`/posts/${postId}`, {
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
  postId: string,
): Promise<EditHistoryDTO[]> => {
  try {
    const response = await api.get<EditHistoryDTO[]>(
      `/posts/${postId}/edit-histories`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const moderatePostInGroup = async (
  token: string,
  groupId: string,
  postId: string,
  action: GroupPostModerationAction,
): Promise<boolean> => {
  try {
    const response = await api.post(
      `/groups/${groupId}/posts/${postId}/moderation`,
      {
        action,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
