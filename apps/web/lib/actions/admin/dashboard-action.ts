import api from '@/lib/api-client';

export interface DashboardQueryDTO {
  from?: Date;
  to?: Date;
}
export const getDashboard = async (
  token: string,
  query: DashboardQueryDTO
): Promise<{
  activeUsers: number;
  totalPosts: number;
  totalGroups: number;
  pendingReports: number;
}> => {
  try {
    const response = await api.get('/admins/dashboard', {
      params: query,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getContentChart = async (
  token: string,
  query: DashboardQueryDTO
): Promise<
  {
    date: string;
    postCount: number;
    commentCount: number;
    shareCount: number;
  }[]
> => {
  try {
    const response = await api.get('/admins/content-chart', {
      params: query,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getReportChart = async (
  token: string,
  query: DashboardQueryDTO
): Promise<
  {
    date: string;
    pendingCount: number;
    resolvedCount: number;
    rejectedCount: number;
  }[]
> => {
  try {
    const response = await api.get('/admins/report-chart', {
      params: query,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export interface EmotionDashboardDTO {
  date: string;
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  surprise: number;
  disgust: number;
}

export const getEmotionDashboard = async (
  token: string,
  query: DashboardQueryDTO
): Promise<EmotionDashboardDTO[]> => {
  try {
    const response = await api.get('/emotion/dashboard', {
      params: query,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
