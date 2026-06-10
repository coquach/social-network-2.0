import api from '@/lib/api-client';
import {
  CursorPageResponse,
  CursorPagination,
  GroupPrivacy,
  GroupSummaryDTO,
  PostSnapshotDTO,
  UserDTO,
} from '@repo/shared';

export interface SearchPostDto extends CursorPagination {
  query: string;
  userId?: string;
  groupId?: string;
  emotion?: string;
}
export const searchPost = async (
  token: string,
  filter: SearchPostDto
): Promise<CursorPageResponse<PostSnapshotDTO>> => {
  try {
    const response = await api.get('/search/posts', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: filter,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export enum SearchGroupSortBy {
  MEMBERS = 'members',
  CREATED_AT = 'createdAt',
}

export interface SearchGroupDto extends CursorPagination {
  query: string;
  groupId?: string;
  privacy?: GroupPrivacy;
  sortBy?: SearchGroupSortBy;
}

export const searchGroup = async (
  token: string,
  filter: SearchGroupDto
): Promise<CursorPageResponse<GroupSummaryDTO>> => {
  try {
    const response = await api.get('/search/groups', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: filter,
    });
    return response.data;
  }
  catch (error) {
    console.error(error);
    throw error;
  }
};

export interface SearchUserDto extends CursorPagination {
  query: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export const searchUser = async (
  token: string,
  filter: SearchUserDto
): Promise<CursorPageResponse<UserDTO>> => {
  try {
    const response = await api.get('/search/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: filter,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
