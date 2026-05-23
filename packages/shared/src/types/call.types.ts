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

// ──────────────────────────────────────────────────────────────────────────────
// Socket event payload types (mirroring chat.gateway.ts emitCallXxx shapes)
// ──────────────────────────────────────────────────────────────────────────────

/** Emitted as 'call.invite' when a call is created. Carries the full session DTO. */
export type CallInvitePayload = CallSessionDTO;

/** Emitted as 'call.accepted' when the callee accepts. */
export interface CallAcceptedPayload {
  callId: string;
  conversationId: string;
  /** The callee who accepted */
  userId: string;
  participants?: string[];
  startedAt?: string;
}

/** Emitted as 'call.rejected' when a callee rejects or initiator cancels. */
export interface CallRejectedPayload {
  callId: string;
  conversationId: string;
  userId: string;
  participants?: string[];
}

/** Emitted as 'call.ended' when a call terminates for any reason. */
export interface CallEndedPayload {
  callId: string;
  conversationId: string;
  userId: string;
  participants?: string[];
  endReason?: CallEndReason;
  durationSec?: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Shared UI state (used by call store in both web & native)
// ──────────────────────────────────────────────────────────────────────────────

export type OutgoingCallStatus = 'dialing' | 'ringing' | 'accepted' | 'rejected' | 'failed';

export interface OutgoingCallState {
  conversationId: string;
  type: CallType;
  status: OutgoingCallStatus;
}
