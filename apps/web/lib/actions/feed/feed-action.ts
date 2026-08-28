import { getApiClient } from "@repo/shared";
import { CursorPageResponse, CursorPagination } from "@repo/shared";
import { FeedDTO } from "@/models/feed/feedDTO";
import { Emotion } from "@/models/social/enums/social.enum";
import { PostSnapshotDTO } from "@/models/social/post/postDTO";

export interface PersonalFeedQuery extends CursorPagination {
  mainEmotion?: Emotion;
}

export const getMyFeed = async (
  token: string,
  query: PersonalFeedQuery,
): Promise<CursorPageResponse<FeedDTO>> => {
  try {
    const response = await getApiClient().get<CursorPageResponse<FeedDTO>>(
      `/feeds/my-feed`,
      {
        params: query,
      },
    );
    return response as any;
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
    const response = await getApiClient().get<
      CursorPageResponse<PostSnapshotDTO>
    >(`/feeds/trending`, {
      params: query,
    });
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const views = async (token: string, feedItemIds: string[]) => {
  try {
    await getApiClient().post(
      `/feeds/views`,
      {
        feedItemIds,
      },
      {},
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};
