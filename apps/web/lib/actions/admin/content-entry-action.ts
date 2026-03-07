import api from '@/lib/api-client';
import { PageResponse, Pagination } from '@/lib/pagination.dto';
import { TargetType } from '@/models/social/enums/social.enum';
import { ContentEntryDTO, ContentStatus } from '@/models/social/post/contentEntryDTO';

export interface ContentEntryFilter extends Pagination {
  query?: string;
  targetType?: TargetType;
  status?: ContentStatus;
  createAt?: Date;
}

export const getContentEntry = async (
  token: string,
  filter: ContentEntryFilter
): Promise<PageResponse<ContentEntryDTO>> => {
  try {
    const response = await api.get<PageResponse<ContentEntryDTO>>(
      '/admins/contents',
      {
        params: filter,
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
