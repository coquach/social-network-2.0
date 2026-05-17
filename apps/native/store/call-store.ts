import { create } from 'zustand';
import { CallSessionDTO, CallType } from '@repo/shared';

type CallState = {
  activeCall: CallSessionDTO | null;
  incomingCall: CallSessionDTO | null;
  outgoingCall: {
    conversationId: string;
    type: CallType;
    status: 'dialing' | 'ringing' | 'accepted' | 'rejected' | 'failed';
  } | null;
  
  // Actions
  setIncomingCall: (call: CallSessionDTO | null) => void;
  setOutgoingCall: (call: CallState['outgoingCall']) => void;
  setActiveCall: (call: CallSessionDTO | null) => void;
  reset: () => void;
};

export const useCallStore = create<CallState>((set) => ({
  activeCall: null,
  incomingCall: null,
  outgoingCall: null,

  setIncomingCall: (incomingCall) => set({ incomingCall }),
  setOutgoingCall: (outgoingCall) => set({ outgoingCall }),
  setActiveCall: (activeCall) => set({ activeCall }),
  reset: () => set({ activeCall: null, incomingCall: null, outgoingCall: null }),
}));
