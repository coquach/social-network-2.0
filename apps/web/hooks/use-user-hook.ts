'use client';


import { getUser, updateUser } from '@/lib/actions/user/user-actions';
import { ProfileUpdateForm, UserDTO } from '@/models/user/userDTO';
import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';


export const useGetUser = (userId: string) => {
  const { getToken } = useAuth();
  return useQuery<UserDTO>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await getUser(token, userId);
    },
    enabled: !!userId,
  });
};

export const useUpdateUser = (userId: string) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (update: ProfileUpdateForm) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await updateUser(token, update);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Cập nhật hồ sơ thành công!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
