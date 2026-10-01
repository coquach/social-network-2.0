import api from '@/lib/api-client';
import { CursorPageResponse, CursorPagination, NotificationDTO } from '@repo/shared';

export const getNotifications = async (
  token: string,
  query: CursorPagination
): Promise<CursorPageResponse<NotificationDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<NotificationDTO>>(
      '/notifications',
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
