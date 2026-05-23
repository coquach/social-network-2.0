import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callService } from '../api/services/call.service';
import { queryKeys } from './query-keys';
import { CreateCallInput, RequestCallMediaTokenInput } from '../types/call.types';

export function useCall(callId: string) {
  return useQuery({
    queryKey: queryKeys.calls.detail(callId),
    queryFn: () => callService.getCallById(callId),
    enabled: !!callId,
  });
}

export function useCreateCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCallInput) => callService.createCall(input),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.calls.detail(data.id), data);
    },
  });
}

export function useAcceptCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (callId: string) => callService.acceptCall(callId),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.calls.detail(data.id), data);
    },
  });
}

export function useRejectCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (callId: string) => callService.rejectCall(callId),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.calls.detail(data.id), data);
    },
  });
}

export function useEndCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (callId: string) => callService.endCall(callId),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.calls.detail(data.id), data);
    },
  });
}

export function useJoinCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (callId: string) => callService.joinCall(callId),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.calls.detail(data.id), data);
    },
  });
}

export function useLeaveCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (callId: string) => callService.leaveCall(callId),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.calls.detail(data.id), data);
    },
  });
}

export function useIssueCallMediaToken() {
  return useMutation({
    mutationFn: (input: RequestCallMediaTokenInput) =>
      callService.issueCallMediaToken(input),
  });
}

export function useIssueUserMediaToken() {
  return useMutation({
    mutationFn: () => callService.issueUserMediaToken(),
  });
}
