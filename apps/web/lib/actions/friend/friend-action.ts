import api from '@/lib/api-client';
import {
  CursorPageResponse,
  CursorPagination,
} from '@repo/shared';

type UserSnapshot = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
};

export const getRelationshipStatus = async (
  token: string,
  targetId: string
): Promise<{
  status: 'FRIEND' | 'BLOCKED' | 'REQUESTED_OUT' | 'REQUESTED_IN' | 'NONE';
}> => {
  try {
    const res = await api.get(`/social/relationship/${targetId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error getting relationship status:', error);
    throw error;
  }
};

export const sendFriendRequest = async (token: string, targetId: string) => {
  try {
    const res = await api.post(`/social/request/${targetId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

export const cancelFriendRequest = async (token: string, targetId: string) => {
  try {
    const res = await api.post(`/social/cancel/${targetId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error canceling friend request:', error);
    throw error;
  }
};

export const acceptFriendRequest = async (
  token: string,
  requesterId: string
) => {
  try {
    const res = await api.post(`/social/accept/${requesterId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

export const declineFriendRequest = async (
  token: string,
  requesterId: string
) => {
  try {
    const res = await api.post(`/social/decline/${requesterId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error declining friend request:', error);
    throw error;
  }
};

export const removeFriend = async (token: string, friendId: string) => {
  try {
    const res = await api.post(`/social/remove/${friendId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
};

export const blockUser = async (token: string, targetId: string) => {
  try {
    const res = await api.post(`/social/block/${targetId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
};

export const unblockUser = async (token: string, targetId: string) => {
  try {
    const res = await api.post(`/social/unblock/${targetId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
};

export const getFriendRequests = async (
  token: string,
  query: CursorPagination
): Promise<CursorPageResponse<string>> => {
  try {
    const res = await api.get('/social/requests', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: query,
    });
    return res.data;
  } catch (error) {
    console.error('Error getting friend requests:', error);
    throw error;
  }
};
export const getFriends = async (
  token: string,
  query: CursorPagination,
  userId?: string
): Promise<CursorPageResponse<string>> => {
  try {
    const url = userId ? `/social/friends/${userId}` : '/social/friends/me';
    const res = await api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: query,
    });
    return res.data;
  } catch (error) {
    console.error('Error getting friends:', error);
    throw error;
  }
};

export const getUserFriends = async (
  token: string,
  userId: string,
  query: CursorPagination
): Promise<CursorPageResponse<string>> => {
  try {
    const res = await api.get(`/social/friends/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: query,
    });
    return res.data;
  } catch (error) {
    console.error('Error getting user friends:', error);
    throw error;
  }
};

export const getFriendSuggestions = async (
  token: string,
  query: CursorPagination
): Promise<
  CursorPageResponse<{
    id: string;
    mutualFriends: number;
    mutualFriendIds: string[];
    user?: UserSnapshot | null;
    mutualFriendPreview?: UserSnapshot[];
    commonGroups?: number;
    commonGroupIds?: string[];
    score?: number;
    reasons?: string[];
    recommendationId?: string;
    recommendationRequestId?: string;
  }>
> => {
  try {
    const res = await api.get('/social/friends/recommend', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: query,
    });
    return res.data;
  } catch (error) {
    console.error('Error getting friend suggestions:', error);
    throw error;
  }
};

export const getBlockedUsers = async (
  token: string,
  query: CursorPagination
): Promise<CursorPageResponse<string>> => {
  try {
    const res = await api.get('/social/blocked', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: query,
    });
    return res.data;
  } catch (error) {
    console.error('Error getting blocked users:', error);
    throw error;
  }
};
