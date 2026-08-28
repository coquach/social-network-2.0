import { getApiClient } from "@repo/shared";
import { PageResponse, Pagination } from "@repo/shared";
import { TargetType } from "@/models/social/enums/social.enum";
import {
  ContentEntryDTO,
  ContentStatus,
} from "@/models/social/post/contentEntryDTO";

export interface ContentEntryFilter extends Pagination {
  query?: string;
  targetType?: TargetType;
  status?: ContentStatus;
  createAt?: Date;
}

export const getContentEntry = async (
  token: string,
  filter: ContentEntryFilter,
): Promise<PageResponse<ContentEntryDTO>> => {
  try {
    const response = await getApiClient().get<PageResponse<ContentEntryDTO>>(
      "/admin/contents",
      {
        params: filter,
      },
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
