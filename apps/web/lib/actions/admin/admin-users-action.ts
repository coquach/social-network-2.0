import { getApiClient } from "@repo/shared";
import { PageResponse, Pagination } from "@repo/shared";
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
  filter: SystemUserFilter,
): Promise<PageResponse<SystemUserDTO>> => {
  try {
    const response = await getApiClient().get<PageResponse<SystemUserDTO>>(
      `users/admin/system-users`,
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

export const createSystemUser = async (
  token: string,
  data: CreateSystemUserDTO,
): Promise<SystemUserDTO> => {
  try {
    const response = await getApiClient().post<SystemUserDTO>(
      `users/admin/system-users`,
      data,
      {},
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateSystemUserRole = async (
  token: string,
  userId: string,
  role: SystemRole,
): Promise<boolean> => {
  try {
    const response = await getApiClient().patch<boolean>(
      `users/admin/system-users/${userId}/role`,
      { role },
      {},
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const banUser = async (
  token: string,
  userId: string,
): Promise<boolean> => {
  try {
    const response = await getApiClient().post<boolean>(
      `users/admin/${userId}/ban`,
      {},
      {},
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const unbanUser = async (
  token: string,
  userId: string,
): Promise<boolean> => {
  try {
    const response = await getApiClient().post<boolean>(
      `users/admin/${userId}/unban`,
      {},
      {},
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
