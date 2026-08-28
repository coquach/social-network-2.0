import { getApiClient } from "@repo/shared";
import { CursorPageResponse, CursorPagination } from "@repo/shared";
import { NotificationDTO } from "@/models/notification/notificationDTO";

export const getNotifications = async (
  token: string,
  query: CursorPagination,
): Promise<CursorPageResponse<NotificationDTO>> => {
  try {
    const response = await getApiClient().get<
      CursorPageResponse<NotificationDTO>
    >("/notifications", {
      params: query,
    });
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const markNotificationAsRead = async (
  token: string,
  id: string,
): Promise<void> => {
  try {
    await getApiClient().patch(`/notifications/${id}/read`, {}, {});
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (
  token: string,
): Promise<void> => {
  try {
    await getApiClient().patch("/notifications/read-all", {}, {});
  } catch (error) {
    console.error(error);
    throw error;
  }
};
