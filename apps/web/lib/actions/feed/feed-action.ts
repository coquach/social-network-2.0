import api from '@/lib/api-client';
import {
  CursorPageResponse,
  CursorPagination,
  FeedDTO,
  Emotion,
  PostSnapshotDTO,
} from '@repo/shared';

export interface PersonalFeedQuery extends CursorPagination {
  mainEmotion?: Emotion;
}

export const getMyFeed = async (
  token: string,
  query: PersonalFeedQuery,
): Promise<CursorPageResponse<FeedDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<FeedDTO>>(
      `/feeds/my-feed`,
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

export interface TrendingQuery extends CursorPagination {
  mainEmotion?: Emotion;
}

export const getTrendingFeed = async (
  token: string,
  query: TrendingQuery,
): Promise<CursorPageResponse<PostSnapshotDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<PostSnapshotDTO>>(
      `/feeds/trending`,
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

export const views = async (token: string, feedItemIds: string[]) => {
  try {
    await api.post(
      `/feeds/views`,
      {
        feedItemIds,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};
