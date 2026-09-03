import { getApiClient } from "@repo/shared";
import { CreateUserInput as UserCreateForm, UserDTO } from '@repo/shared';
import { ProfileUpdateForm } from '@/lib/schemas/profile.schema';

export const getUser = async (
  token: string,
  userId: string,
): Promise<UserDTO> => {
  try {
    const response = await getApiClient().get<UserDTO>(`/users/${userId}`, {});
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createUser = async (data: UserCreateForm) => {
  try {
    const response = await getApiClient().post(`/users`, data);
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateUser = async (token: string, data: ProfileUpdateForm) => {
  try {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (value instanceof File) {
        formData.append(key, value);
        return;
      }

      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
        return;
      }

      formData.append(key, value.toString());
    });

    const response = await getApiClient().patch(`/users`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
