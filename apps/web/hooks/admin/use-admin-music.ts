'use client';

import { useAuth } from '@clerk/nextjs';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { PageResponse } from '@repo/shared';

import {
  AnalyzeMusicDTO,
  CreateMusicFeatureDTO,
  MusicFeatureResponseDTO,
  UpdateMusicFeatureDTO,
} from '@/models/music/musicDTO';
import {
  analyzeMusic,
  createMusicFeature,
  deleteMusicFeature,
  getMusicFeatureById,
  getMusicFeatures,
  MusicQuery,
  updateMusicFeature,
} from '@/lib/actions/admin/admin-music';
import { withAbortOnUnload } from '@/utils/with-abort-unload';

const MUSIC_QUERY_KEY = ['admin-musics'] as const;
const MUSIC_DETAIL_QUERY_KEY = ['admin-music'] as const;

type MusicListResponse = PageResponse<MusicFeatureResponseDTO>;

const assertToken = async (getToken: () => Promise<string | null>) => {
  const token = await getToken();

  if (!token) {
    throw new Error('Token is required');
  }

  return token;
};

const invalidateMusicQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  queryClient.invalidateQueries({ queryKey: MUSIC_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: MUSIC_DETAIL_QUERY_KEY });
};

const optimisticDeleteFromLists = (
  queryClient: ReturnType<typeof useQueryClient>,
  musicId: string,
) => {
  const snapshots = queryClient.getQueriesData<MusicListResponse>({
    queryKey: MUSIC_QUERY_KEY,
  });

  snapshots.forEach(([queryKey, current]) => {
    if (!current) return;

    queryClient.setQueryData<MusicListResponse>(queryKey, {
      ...current,
      data: current.data.filter((music) => music.id !== musicId),
      total: Math.max(0, current.total - 1),
    });
  });

  return snapshots;
};

const restoreSnapshots = (
  queryClient: ReturnType<typeof useQueryClient>,
  snapshots: Array<[readonly unknown[], MusicListResponse | undefined]>,
) => {
  snapshots.forEach(([queryKey, current]) => {
    if (current) {
      queryClient.setQueryData(queryKey, current);
    }
  });
};

export const useAdminMusicList = (query: MusicQuery) => {
  const { getToken } = useAuth();

  return useQuery<MusicListResponse>({
    queryKey: [...MUSIC_QUERY_KEY, query],
    queryFn: async () => {
      const token = await assertToken(getToken);

      return getMusicFeatures(token, query);
    },
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    gcTime: 120_000,
  });
};

export const useAdminMusic = (id?: string) => {
  const { getToken } = useAuth();

  return useQuery<MusicFeatureResponseDTO>({
    queryKey: [...MUSIC_DETAIL_QUERY_KEY, id],
    enabled: Boolean(id),
    queryFn: async () => {
      const token = await assertToken(getToken);

      if (!id) {
        throw new Error('Music id is required');
      }

      return getMusicFeatureById(token, id);
    },
    staleTime: 10_000,
    gcTime: 120_000,
  });
};

export const useCreateAdminMusic = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...MUSIC_QUERY_KEY, 'create'],
    mutationFn: async (payload: CreateMusicFeatureDTO) => {
      return withAbortOnUnload(async () => {
        const token = await assertToken(getToken);
        return createMusicFeature(token, payload);
      });
    },
    onSuccess: () => {
      toast.success('Đã tạo nhạc mới');
      invalidateMusicQueries(queryClient);
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Không thể tạo nhạc mới');
    },
  });
};

export const useUpdateAdminMusic = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...MUSIC_QUERY_KEY, 'update'],
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateMusicFeatureDTO;
    }) => {
      const token = await assertToken(getToken);
      return updateMusicFeature(token, id, payload);
    },
    onSuccess: (data, variables) => {
      toast.success('Đã cập nhật nhạc');
      invalidateMusicQueries(queryClient);
      queryClient.setQueryData([...MUSIC_DETAIL_QUERY_KEY, variables.id], data);
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Không thể cập nhật nhạc');
    },
  });
};

export const useDeleteAdminMusic = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...MUSIC_QUERY_KEY, 'delete'],
    mutationFn: async (id: string) => {
      const snapshots = optimisticDeleteFromLists(queryClient, id);

      try {
        const token = await assertToken(getToken);
        return await deleteMusicFeature(token, id);
      } catch (error) {
        restoreSnapshots(queryClient, snapshots);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Đã xóa nhạc');
      invalidateMusicQueries(queryClient);
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Không thể xóa nhạc');
    },
  });
};

export const useAnalyzeMusic = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...MUSIC_QUERY_KEY, 'analyze'],
    mutationFn: async (payload: AnalyzeMusicDTO) => {
      const token = await assertToken(getToken);
      return analyzeMusic(token, payload);
    },
    onSuccess: (data) => {
      if (data.result) {
        toast.success('Đã phân tích cảm xúc âm nhạc');
      } else {
        toast.error('Không thể trích xuất cảm xúc từ file này');
      }

      queryClient.invalidateQueries({ queryKey: MUSIC_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Không thể phân tích cảm xúc âm nhạc');
    },
  });
};

export const useMusicFeatures = useAdminMusicList;
export const useMusicFeature = useAdminMusic;
export const useCreateMusicFeature = useCreateAdminMusic;
export const useUpdateMusicFeature = useUpdateAdminMusic;
export const useDeleteMusicFeature = useDeleteAdminMusic;
