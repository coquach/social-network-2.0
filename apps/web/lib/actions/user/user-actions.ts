
import api from '@/lib/api-client';
import {
  ProfileUpdateForm,
  UserCreateForm,
  UserDTO,
} from '@/models/user/userDTO';

export const getUser = async (
  token: string,
  userId: string
): Promise<UserDTO> => {
  try {
    const response = await api.get<UserDTO>(`/users/${userId}`, {
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

export const createUser = async (data: UserCreateForm) => {
  try {
    const response = await api.post(`/users`, data);
    return response.data;
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
        // Nếu là file thì append file
        formData.append(key, value);
      } else {
        // còn lại stringify bình thường
        formData.append(key, value.toString());
      }
    });
    const response = await api.patch(`/users`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

