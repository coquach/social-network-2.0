import { getApiClient } from '../client';
import {
  CallMediaTokenResponseDTO,
  CallSessionDTO,
  CreateCallInput,
  RequestCallMediaTokenInput,
  StreamUserTokenResponseDTO,
} from '../../types/call.types';

const mapCallSession = (session: any): CallSessionDTO => {
  if (!session) return session;
  return {
    ...session,
    id: session._id ?? session.id,
  };
};

export const callService = {
  async getCallById(callId: string): Promise<CallSessionDTO> {
    const response = await getApiClient().get<any>(`/chats/calls/${callId}`);
    return mapCallSession(response);
  },

  async createCall(input: CreateCallInput): Promise<CallSessionDTO> {
    const response = await getApiClient().post<any>('/chats/calls', input);
    return mapCallSession(response);
  },

  async acceptCall(callId: string): Promise<CallSessionDTO> {
    const response = await getApiClient().post<any>(`/chats/calls/${callId}/accept`);
    return mapCallSession(response);
  },

  async rejectCall(callId: string): Promise<CallSessionDTO> {
    const response = await getApiClient().post<any>(`/chats/calls/${callId}/reject`);
    return mapCallSession(response);
  },

  async endCall(callId: string): Promise<CallSessionDTO> {
    const response = await getApiClient().post<any>(`/chats/calls/${callId}/end`);
    return mapCallSession(response);
  },

  async joinCall(callId: string): Promise<CallSessionDTO> {
    const response = await getApiClient().post<any>(`/chats/calls/${callId}/join`);
    return mapCallSession(response);
  },

  async leaveCall(callId: string): Promise<CallSessionDTO> {
    const response = await getApiClient().post<any>(`/chats/calls/${callId}/leave`);
    return mapCallSession(response);
  },

  async issueCallMediaToken(
    input: RequestCallMediaTokenInput,
  ): Promise<CallMediaTokenResponseDTO> {
    return getApiClient().post(`/chats/calls/media-token`, input);
  },

  async issueUserMediaToken(): Promise<StreamUserTokenResponseDTO> {
    return getApiClient().post(`/chats/calls/user-token`);
  },
};
