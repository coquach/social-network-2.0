import { getApiClient } from '../client';
import {
  CallMediaTokenResponseDTO,
  CallSessionDTO,
  CreateCallInput,
  RequestCallMediaTokenInput,
  StreamUserTokenResponseDTO,
} from '../../types/call.types';

export const callService = {
  async getCallById(callId: string): Promise<CallSessionDTO> {
    return getApiClient().get(`/calls/${callId}`);
  },

  async createCall(input: CreateCallInput): Promise<CallSessionDTO> {
    return getApiClient().post('/calls', input);
  },

  async acceptCall(callId: string): Promise<CallSessionDTO> {
    return getApiClient().post(`/calls/${callId}/accept`);
  },

  async rejectCall(callId: string): Promise<CallSessionDTO> {
    return getApiClient().post(`/calls/${callId}/reject`);
  },

  async endCall(callId: string): Promise<CallSessionDTO> {
    return getApiClient().post(`/calls/${callId}/end`);
  },

  async joinCall(callId: string): Promise<CallSessionDTO> {
    return getApiClient().post(`/calls/${callId}/join`);
  },

  async leaveCall(callId: string): Promise<CallSessionDTO> {
    return getApiClient().post(`/calls/${callId}/leave`);
  },

  async issueCallMediaToken(input: RequestCallMediaTokenInput): Promise<CallMediaTokenResponseDTO> {
    return getApiClient().post(`/calls/media-token`, input);
  },

  async issueUserMediaToken(): Promise<StreamUserTokenResponseDTO> {
    return getApiClient().post(`/calls/user-token`);
  },
};
