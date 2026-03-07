import {
  disReact,
  getReactions,
  GetReactionsDto,
  react,
} from '@/lib/actions/social/reaction/reaction-action';
import { CursorPageResponse, getStandardNextPageParam } from '@repo/shared';
import { handleMutationError } from '@/lib/mutation-utils';
import { queryKeys } from '@/lib/query-keys';
import { getQueryClient } from '@/lib/query-client';
import {
  CreateReactionForm,
  DisReactionForm,
  ReactionDTO,
} from '@/models/social/reaction/reactionDTO';
import { useAuth } from '@clerk/nextjs';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';

export const useGetReactions = (query: GetReactionsDto) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<ReactionDTO>>({
    queryKey: queryKeys.reactions.list(
      query.targetId,
      query.targetType,
      query.reactionType,
    ),
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await getReactions(token, {
        ...query,
        cursor: pageParam,
      } as GetReactionsDto);
    },
    getNextPageParam: getStandardNextPageParam,
    initialPageParam: undefined,
    staleTime: 10_000,
    gcTime: 120_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    enabled: !!query.targetId,
  });
};

export const useReact = (targetId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateReactionForm) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await react(token, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reactions.list(targetId) });
    },
    onError: handleMutationError({ 
      userMessage: 'Không thể thể hiện cảm xúc. Vui lòng thử lại.' 
    }),
  });
};

export const useDisReact = (targetId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (dto: DisReactionForm) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await disReact(token, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reactions.list(targetId) });
    },
    onError: handleMutationError({ 
      userMessage: 'Không thể bỏ cảm xúc. Vui lòng thử lại.' 
    }),
  });
};
