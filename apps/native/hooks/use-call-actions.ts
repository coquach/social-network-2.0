import {
  CallType,
  useAcceptCall,
  useCallStore,
  useCreateCall,
  useEndCall,
  useJoinCall,
  useRejectCall,
  useLeaveCall,
  queryKeys,
  ConversationDTO,
} from '@repo/shared';
import { useCallClient } from '~/providers/call-provider';
import { useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

export type CallErrorCode =
  | 'USER_BUSY_IN_ANOTHER_CALL'
  | 'RECIPIENT_BUSY'
  | 'CONVERSATION_BUSY'
  | 'STREAM_ERROR'
  | 'UNKNOWN';

export type StartCallResult =
  | { ok: true }
  | { ok: false; code: CallErrorCode; message: string };

function parseCallError(error: unknown): { code: CallErrorCode; message: string } {
  const backendMsg = (error as any)?.responseData?.message || (error as any)?.response?.data?.message;
  const msg = backendMsg || (error as any)?.message || String(error);

  if (msg.includes('USER_BUSY_IN_ANOTHER_CALL')) {
    return { code: 'USER_BUSY_IN_ANOTHER_CALL', message: 'Bạn đang trong một cuộc gọi khác.' };
  }
  if (msg.includes('RECIPIENT_BUSY')) {
    return { code: 'RECIPIENT_BUSY', message: 'Người nhận đang bận.' };
  }
  if (msg.includes('Conversation already has an active call')) {
    return { code: 'CONVERSATION_BUSY', message: 'Cuộc trò chuyện đang có cuộc gọi.' };
  }
  if (msg.includes('media infrastructure')) {
    return { code: 'STREAM_ERROR', message: 'Không thể kết nối dịch vụ cuộc gọi. Vui lòng thử lại.' };
  }
  return { code: 'UNKNOWN', message: 'Không thể tạo cuộc gọi. Vui lòng thử lại.' };
}

export function useCallActions() {
  const client = useCallClient();
  const queryClient = useQueryClient();
  const {
    setOutgoingCall,
    setActiveCall,
    setIncomingCall,
    reset,
    incomingCall,
    activeCall,
  } = useCallStore();

  // Guard ref to prevent double-call race condition
  const isStartingCall = useRef(false);

  const { mutateAsync: createCallSession } = useCreateCall();
  const { mutateAsync: acceptCallSession } = useAcceptCall();
  const { mutateAsync: rejectCallSession } = useRejectCall();
  const { mutateAsync: endCallSession } = useEndCall();
  const { mutateAsync: leaveCallSession } = useLeaveCall();
  const { mutateAsync: joinCallSession } = useJoinCall();

  const startCall = useCallback(
    async (conversationId: string, type: CallType): Promise<StartCallResult> => {
      // Hard guard: prevent double-call
      if (isStartingCall.current) {
        console.warn('[Call] startCall already in progress, ignoring.');
        return { ok: false, code: 'UNKNOWN', message: 'Cuộc gọi đang được khởi tạo.' };
      }
      isStartingCall.current = true;

      try {
        setOutgoingCall({ conversationId, type, status: 'dialing' });

        const session = await createCallSession({ conversationId, type });
        // Set activeCall immediately so endCall/cancel can reference the ID
        setActiveCall(session);
        setOutgoingCall({ conversationId, type, status: 'ringing' });

        if (!client) throw new Error('Stream client not initialized');

        const call = client.call('default', session.id);

        // Phase 2.3: getOrCreate first, THEN control camera/mic
        // Avoids spinning up hardware before the call room actually exists on Stream
        const conversation = queryClient.getQueryData<ConversationDTO>(
          queryKeys.conversations.detail(conversationId),
        );
        const isGroup = conversation?.isGroup === true;
        const members = (conversation?.participants ?? []).map((id) => ({
          user_id: id,
        }));

        if (isGroup) {
          setActiveCall(session);
          setOutgoingCall(null);
          await call.join({ create: true, data: { members, custom: { type } } });
          
          if (type === CallType.AUDIO) {
            await call.camera.disable();
          } else {
            await call.camera.enable();
          }
          await call.microphone.enable();
        } else {
          // 1-to-1 call: don't join or enable hardware yet.
          const currentState = useCallStore.getState();
          if (currentState.activeCall?.conversationId === conversationId) {
            // Call was accepted via WebSocket before HTTP finished! Do not revert to ringing.
          } else {
            setOutgoingCall({ id: session._id || session.id, conversationId, type, status: 'ringing' });
          }
          await call.getOrCreate({
            ring: true,
            data: { members, custom: { type } },
          });
        }
        return { ok: true };
      } catch (error) {
        console.error('[Call] Failed to start call:', error);
        reset();
        return { ok: false, ...parseCallError(error) };
      } finally {
        isStartingCall.current = false;
      }
    },
    [client, createCallSession, setActiveCall, setOutgoingCall, reset, queryClient],
  );

  const answerCall = useCallback(async () => {
    if (!incomingCall || !client) return;

    try {
      await acceptCallSession(incomingCall.id);

      const call = client.call('default', incomingCall.id);
      await call.join();

      // Notify BE so Redis group-online-set stays accurate
      void joinCallSession(incomingCall.id).catch((e) =>
        console.warn('[Call] joinCallSession error:', e),
      );

      // Control camera after joining
      if (incomingCall.type === CallType.AUDIO) {
        await call.camera.disable();
      } else {
        await call.camera.enable();
      }
      
      // Ensure microphone is explicitly enabled for the callee
      await call.microphone.enable();

      setActiveCall(incomingCall);
      setIncomingCall(null);
    } catch (error) {
      console.error('[Call] Failed to answer call:', error);
      Alert.alert('Không thể kết nối', 'Cuộc gọi đã kết thúc hoặc không còn đổ chuông.');
      reset();
    }
  }, [acceptCallSession, joinCallSession, client, setActiveCall, setIncomingCall, incomingCall, reset]);

  const rejectCall = useCallback(async () => {
    if (!incomingCall || !client) return;

    try {
      const call = client.call('default', incomingCall.id);
      
      // If it's a 1-to-1 call, we explicitly reject on backend and Stream
      if (!incomingCall.isGroupCall) {
        // Fire-and-forget both — don't let either block the UI reset
        void rejectCallSession(incomingCall.id).catch((e) =>
          console.warn('[Call] rejectCallSession error:', e),
        );
        void call.reject().catch((e) =>
          console.warn('[Call] call.reject error:', e),
        );
      }
      // For group calls, rejecting just means "Dismiss", so we do nothing on the backend
      // to avoid ending the call for everyone.
    } finally {
      setIncomingCall(null);
    }
  }, [incomingCall, client, rejectCallSession, setIncomingCall]);

  const endCall = useCallback(async (explicitCallId?: string, explicitIsGroup?: boolean) => {
    const store = useCallStore.getState();
    const callId = explicitCallId || store.activeCall?.id || store.outgoingCall?.id;
    const isGroup = explicitIsGroup !== undefined ? explicitIsGroup : store.activeCall?.isGroupCall;

    // Reset store immediately so UI unblocks right away
    reset();

    if (!callId) return;

    if (client) {
      const call = client.call('default', callId);
      if (isGroup) {
        void call.leave().catch((e) =>
          console.warn('[Call] call.leave error:', e),
        );
      } else {
        void call.endCall().catch((e) =>
          console.warn('[Call] call.endCall error:', e),
        );
      }
    }
    
    if (isGroup) {
      void leaveCallSession(callId).catch((e) =>
        console.warn('[Call] leaveCallSession error:', e),
      );
    } else {
      void endCallSession(callId).catch((e) =>
        console.warn('[Call] endCallSession error:', e),
      );
    }
  }, [activeCall, client, endCallSession, leaveCallSession, reset]);

  const joinOngoingCall = useCallback(async (callId: string, type: CallType = CallType.VIDEO) => {
    if (!client) return;
    try {
      const call = client.call('default', callId);
      await call.join();

      void joinCallSession(callId).catch((e) =>
        console.warn('[Call] joinCallSession error:', e),
      );

      if (type === CallType.AUDIO) {
        await call.camera.disable();
      } else {
        await call.camera.enable();
      }

      const existingCall = queryClient.getQueryData(queryKeys.calls.detail(callId)) as any;
      if (existingCall) {
        setActiveCall(existingCall);
      } else {
        // Fallback: create a dummy active call state so UI opens
        setActiveCall({
          _id: callId,
          id: callId,
          conversationId: 'unknown',
          initiatorId: 'unknown',
          type: type,
          status: 'accepted' as any,
          participants: [],
        } as any);
      }
    } catch (error) {
      console.error('[Call] Failed to join ongoing call:', error);
    }
  }, [client, joinCallSession, setActiveCall, queryClient]);

  return {
    startCall,
    answerCall,
    rejectCall,
    endCall,
    joinOngoingCall,
  };
}
