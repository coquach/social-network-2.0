import { z } from 'zod';

export enum CallType {
  AUDIO= 'audio',
  VIDEO = 'video',
}

export enum CallSessionStatus {
  INITIATED = 'initiated',
  RINGING = 'ringing',
  ACCEPTED = 'accepted',
  ENDED = 'ended',
  REJECTED = 'rejected',
  MISSED = 'missed',
  CANCELLED = 'cancelled',
}

export enum CallEndReason {
  HANGUP = 'hangup',
  REJECTED = 'rejected',
  MISSED = 'missed',
  TIMEOUT = 'timeout',
  FAILED = 'failed',
  KICKED = 'kicked',
}

export interface CallSessionDTO {
  _id: string;
  id: string; // Populated by service for compatibility
  conversationId: string;
  initiatorId: string;
  type: CallType;
  status: CallSessionStatus;
  participants: string[];
  startedAt?: Date;
  endedAt?: Date;
  endReason?: CallEndReason;
  createdAt?: Date;
  updatedAt?: Date;
  callMessageId?: string;
  isGroupCall?: boolean;
  maxParticipants?: number;
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
