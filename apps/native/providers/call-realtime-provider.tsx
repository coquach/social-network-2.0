import { useAuth } from '@clerk/expo';
import { CallSessionDTO, CallSessionStatus, queryKeys } from '@repo/shared';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { useCallStore } from '~/store/call-store';
import { useSocket } from '~/providers/socket-provider';

export function CallRealtimeProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { userId, isSignedIn } = useAuth();
  const { chatSocket } = useSocket();
  const { setIncomingCall, setActiveCall, reset } = useCallStore();

  useEffect(() => {
    if (!chatSocket || !isSignedIn || !userId) {
      return;
    }

    const handleCallNew = async (payload: CallSessionDTO) => {
      // If user is a participant but not the initiator
      if (payload.participants.some(p => p.userId === userId) && payload.initiatorId !== userId) {
        if (payload.status === CallSessionStatus.RINGING) {
          // Sync with manual state for now (might be redundant with Stream useCalls)
          setIncomingCall(payload);
        }
      }
    };

    const handleCallUpdated = (payload: CallSessionDTO) => {
      queryClient.setQueryData(queryKeys.calls.detail(payload.id), payload);
      
      // Update active call if it's the one we're in
      const activeCall = useCallStore.getState().activeCall;
      if (activeCall?.id === payload.id) {
        if (payload.status === CallSessionStatus.ENDED || payload.status === CallSessionStatus.TIMEOUT) {
          reset();
        } else {
          setActiveCall(payload);
        }
      }

      // Update incoming call if it's the one ringing
      const incomingCall = useCallStore.getState().incomingCall;
      if (incomingCall?.id === payload.id) {
        if (payload.status !== CallSessionStatus.RINGING) {
          setIncomingCall(null);
        }
        if (payload.status === CallSessionStatus.ACCEPTED && payload.participants.some(p => p.userId === userId && p.status === 'JOINED')) {
            setActiveCall(payload);
        }
      }
    };

    chatSocket.on('call.new', handleCallNew);
    chatSocket.on('call.updated', handleCallUpdated);

    return () => {
      chatSocket.off('call.new', handleCallNew);
      chatSocket.off('call.updated', handleCallUpdated);
    };
  }, [chatSocket, isSignedIn, userId, queryClient, setIncomingCall, setActiveCall, reset]);

  return <>{children}</>;
}
