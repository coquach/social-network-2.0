import api from '@/lib/api-client';
import {
  CursorPageResponse,
  CursorPagination,
} from '@repo/shared';
import { GroupPrivacy } from '@/models/group/enums/group-privacy.enum';
import { GroupSummaryDTO } from '@/models/group/groupDTO';
import { PostSnapshotDTO } from '@/models/social/post/postDTO';
import { UserDTO } from '@/models/user/userDTO';

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
