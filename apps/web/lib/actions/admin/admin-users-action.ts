import api from "@/lib/api-client";
import { PageResponse, Pagination } from "@/lib/pagination.dto";
import {
  CreateSystemUserDTO,
  SystemRole,
  SystemUserDTO,
  UserStatus,
} from "@/models/user/systemUserDTO";

export interface SystemUserFilter extends Pagination {
  query?: string;
  role?: SystemRole;
  status?: UserStatus;
}
export const getSystemUsers = async (
  token: string,
  filter: SystemUserFilter
): Promise<PageResponse<SystemUserDTO>> => {
  try {
    const response = await api.get<PageResponse<SystemUserDTO>>(
      `users/admin/system-users`,
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

export const createSystemUser = async (
  token: string,
  data: CreateSystemUserDTO
): Promise<SystemUserDTO> => {
  try {
    const response = await api.post<SystemUserDTO>(
      `users/admin/system-users`,
      data,
      {
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

export const updateSystemUserRole = async (
  token: string,
  userId: string,
  role: SystemRole
): Promise<boolean> => {
  try {
    const response = await api.patch<boolean>(
      `users/admin/system-users/${userId}/role`,
      { role },
      {
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

export const banUser = async (
  token: string,
  userId: string
): Promise<boolean> => {
  try {
    const response = await api.post<boolean>(`users/admin/${userId}/ban`, {}, {
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
export const unbanUser = async (
  token: string,
  userId: string
): Promise<boolean> => {
  try {
    const response = await api.post<boolean>(`users/admin/${userId}/unban`, {}, {
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
