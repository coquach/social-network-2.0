import { create } from 'zustand';
import {
  CallSessionDTO,
  OutgoingCallState,
} from '../types/call.types';

export type CallStoreState = {
  activeCall: CallSessionDTO | null;
  incomingCall: CallSessionDTO | null;
  outgoingCall: OutgoingCallState | null;
  isMinimized: boolean;

  // Actions
  setIncomingCall: (call: CallSessionDTO | null) => void;
  setOutgoingCall: (call: OutgoingCallState | null) => void;
  setActiveCall: (call: CallSessionDTO | null) => void;
  setMinimized: (minimized: boolean) => void;
  reset: () => void;
};

export const useCallStore = create<CallStoreState>((set) => ({
  activeCall: null,
  incomingCall: null,
  outgoingCall: null,
  isMinimized: false,

  setIncomingCall: (incomingCall) => set({ incomingCall }),
  setOutgoingCall: (outgoingCall) => set({ outgoingCall }),
  setActiveCall: (activeCall) => set({ activeCall }),
  setMinimized: (isMinimized) => set({ isMinimized }),
  reset: () =>
    set({ activeCall: null, incomingCall: null, outgoingCall: null, isMinimized: false }),
}));
