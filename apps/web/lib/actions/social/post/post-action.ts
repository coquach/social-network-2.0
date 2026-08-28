import { getApiClient } from "@repo/shared";
import { CursorPageResponse, CursorPagination } from "@repo/shared";
import { Emotion, PostGroupStatus } from "@/models/social/enums/social.enum";
import {
  CreatePostForm,
  EditHistoryDTO,
  PostDTO,
  PostSnapshotDTO,
  UpdatePostForm,
} from "@/models/social/post/postDTO";

export interface GetPostQuery extends CursorPagination {
  feeling?: Emotion;
}

export type GroupPostModerationAction = "approve" | "reject";

export const getPost = async (
  token: string,
  postId: string,
): Promise<PostDTO> => {
  try {
    const response = await getApiClient().get<PostDTO>(`/posts/${postId}`, {});
    return response as any;
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
    const response = await getApiClient().get<
      CursorPageResponse<PostSnapshotDTO>
    >(`/posts/me`, {
      params: query,
    });
    return response as any;
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
    const response = await getApiClient().get<
      CursorPageResponse<PostSnapshotDTO>
    >(`/posts/user/${userId}`, {
      params: query,
    });
    return response as any;
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
    const response = await getApiClient().get<
      CursorPageResponse<PostSnapshotDTO>
    >(`/groups/${groupId}/posts`, {
      params: query,
    });
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createPost = async (
  token: string,
  data: CreatePostForm,
): Promise<PostSnapshotDTO> => {
  try {
    const response = await getApiClient().post(`/posts`, data, {});
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createPostInGroup = async (
  token: string,
  data: CreatePostForm,
): Promise<{
  post: PostSnapshotDTO;
  status: PostGroupStatus;
  message: string;
}> => {
  try {
    const { groupId, ...payload } = data;
    const response = await getApiClient().post(
      `/groups/${groupId}/posts`,
      payload,
      {},
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updatePost = async (
  token: string,
  postId: string,
  data: UpdatePostForm,
): Promise<PostSnapshotDTO> => {
  try {
    const response = await getApiClient().patch(`/posts/${postId}`, data, {});
    return response as any;
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
  return moderatePostInGroup(token, groupId, postId, "approve");
};

export const rejectPostInGroup = (
  token: string,
  groupId: string,
  postId: string,
) => {
  return moderatePostInGroup(token, groupId, postId, "reject");
};

export const removePost = async (
  token: string,
  postId: string,
): Promise<boolean> => {
  try {
    const response = await getApiClient().delete(`/posts/${postId}`, {});
    return response as any;
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
    const response = await getApiClient().get<EditHistoryDTO[]>(
      `/posts/${postId}/edit-histories`,
      {},
    );
    return response as any;
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
    const response = await getApiClient().post(
      `/groups/${groupId}/posts/${postId}/moderation`,
      {
        action,
      },
      {},
    );

    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
