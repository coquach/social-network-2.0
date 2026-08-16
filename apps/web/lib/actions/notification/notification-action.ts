import api from '@/lib/api-client';
import { CursorPageResponse, CursorPagination } from '@repo/shared';
import { NotificationDTO } from '@/models/notification/notificationDTO';

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

export const markNotificationAsRead = async (
  token: string,
  id: string
): Promise<void> => {
  try {
    await api.patch(
      `/notifications/${id}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (
  token: string
): Promise<void> => {
  try {
    await api.patch(
      '/notifications/read-all',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};
