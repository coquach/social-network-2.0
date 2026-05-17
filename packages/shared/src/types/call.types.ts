import { z } from 'zod';

export enum CallType {
  VOICE = 'VOICE',
  VIDEO = 'VIDEO',
}

export enum CallSessionStatus {
  RINGING = 'RINGING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  ENDED = 'ENDED',
  TIMEOUT = 'TIMEOUT',
}

export enum CallEndReason {
  NORMAL = 'NORMAL',
  REJECTED = 'REJECTED',
  TIMEOUT = 'TIMEOUT',
  ERROR = 'ERROR',
  BUSY = 'BUSY',
  CANCELLED = 'CANCELLED',
}

export interface CallParticipantDTO {
  userId: string;
  joinedAt?: Date;
  leftAt?: Date;
  status: 'IDLE' | 'JOINED' | 'LEFT';
}

export interface CallSessionDTO {
  id: string;
  conversationId: string;
  initiatorId: string;
  type: CallType;
  status: CallSessionStatus;
  participants: CallParticipantDTO[];
  startedAt?: Date;
  endedAt?: Date;
  endReason?: CallEndReason;
}

export interface CallMediaTokenResponseDTO {
  token: string;
  wsUrl: string;
  roomName: string;
  participantIdentity: string;
  callId: string;
  conversationId: string;
  expiresAt: Date;
  audioOnly: boolean;
  iceServers: any[];
  policy: {
    participantLimit: number;
    moderatorUserIds: string[];
    screenShareAllowed: boolean;
    screenShareModeratorOnly: boolean;
  };
}

export interface StreamUserTokenResponseDTO {
  token: string;
}

export const CreateCallInputSchema = z.object({
  conversationId: z.string(),
  type: z.enum(CallType),
});

export type CreateCallInput = z.infer<typeof CreateCallInputSchema>;

export const RequestCallMediaTokenInputSchema = z.object({
  callId: z.string(),
  preferAudioOnly: z.boolean().optional(),
});

export type RequestCallMediaTokenInput = z.infer<typeof RequestCallMediaTokenInputSchema>;
