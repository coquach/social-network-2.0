import {
  CallType,
  useAcceptCall,
  useCreateCall,
  useEndCall,
  useRejectCall,
  queryKeys,
  ConversationDTO,
} from '@repo/shared';
import { useStreamVideoClient } from '@stream-io/video-react-native-sdk';
import { useCallback } from 'react';
import { useCallStore } from '~/store/call-store';
import { useQueryClient } from '@tanstack/react-query';

export function useCallActions() {
  const client = useStreamVideoClient();
  const queryClient = useQueryClient();
  const { 
    setOutgoingCall, 
    setActiveCall, 
    setIncomingCall, 
    reset,
    incomingCall,
    activeCall 
  } = useCallStore();

  const { mutateAsync: createCallSession } = useCreateCall();
  const { mutateAsync: acceptCallSession } = useAcceptCall();
  const { mutateAsync: rejectCallSession } = useRejectCall();
  const { mutateAsync: endCallSession } = useEndCall();

  const startCall = useCallback(
    async (conversationId: string, type: CallType) => {
      try {
        setOutgoingCall({ conversationId, type, status: 'dialing' });

        const session = await createCallSession({ conversationId, type });
        setOutgoingCall({ conversationId, type, status: 'ringing' });

        if (!client) throw new Error('Stream client not initialized');

        const call = client.call('default', session.id);
        
        // Get conversation members to notify them via Stream's ringing flow
        const conversation = queryClient.getQueryData<ConversationDTO>(queryKeys.conversations.detail(conversationId));
        const members = (conversation?.participants ?? []).map(id => ({ user_id: id }));

        await call.getOrCreate({
          ring: true,
          data: {
            members,
            custom: {
              type, // VOICE or VIDEO
            }
          }
        });
        
        setActiveCall(session);
        setOutgoingCall({ conversationId, type, status: 'accepted' });
      } catch (error) {
        console.error('[Call] Failed to start call:', error);
        setOutgoingCall(null);
        reset();
      }
    },
    [client, createCallSession, setActiveCall, setOutgoingCall, reset, queryClient, incomingCall, activeCall],
  );

  const answerCall = useCallback(async () => {
    if (!incomingCall || !client) return;

    try {
      await acceptCallSession(incomingCall.id);
      
      const call = client.call('default', incomingCall.id);
      await call.join();

      setActiveCall(incomingCall);
      setIncomingCall(null);
    } catch (error) {
      console.error('[Call] Failed to answer call:', error);
    }
  }, [acceptCallSession, client, setActiveCall, setIncomingCall, incomingCall]);

  const rejectCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      await rejectCallSession(incomingCall.id);
      setIncomingCall(null);
    } catch (error) {
      console.error('[Call] Failed to reject call:', error);
    }
  }, [incomingCall, rejectCallSession, setIncomingCall]);

  const endCall = useCallback(async () => {
    if (!activeCall) {
        reset();
        return;
    }

    try {
      await endCallSession(activeCall.id);
      if (client) {
          const call = client.call('default', activeCall.id);
          await call.leave();
      }
      reset();
    } catch (error) {
      console.error('[Call] Failed to end call:', error);
      reset();
    }
  }, [activeCall, client, endCallSession, reset]);

  return {
    startCall,
    answerCall,
    rejectCall,
    endCall,
  };
}
