import {
  CallType,
  useAcceptCall,
  useCallStore,
  useCreateCall,
  useEndCall,
  useJoinCall,
  useRejectCall,
  queryKeys,
  ConversationDTO,
  callService,
  useLeaveCall,
} from '@repo/shared';
import { useCallClient } from '@/providers/call-provider';
import { useCallback, useRef } from 'react';
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

function parseCallError(error: unknown): {
  code: CallErrorCode;
  message: string;
} {
  const backendMsg =
    (error as any)?.responseData?.message ||
    (error as any)?.response?.data?.message;
  const msg = backendMsg || (error as any)?.message || String(error);

  if (msg.includes('USER_BUSY_IN_ANOTHER_CALL')) {
    return {
      code: 'USER_BUSY_IN_ANOTHER_CALL',
      message: 'Bạn đang trong một cuộc gọi khác.',
    };
  }
  if (msg.includes('RECIPIENT_BUSY')) {
    return { code: 'RECIPIENT_BUSY', message: 'Người nhận đang bận.' };
  }
  if (msg.includes('Conversation already has an active call')) {
    return {
      code: 'CONVERSATION_BUSY',
      message: 'Cuộc trò chuyện đang có cuộc gọi.',
    };
  }
  if (msg.includes('media infrastructure')) {
    return {
      code: 'STREAM_ERROR',
      message: 'Không thể kết nối dịch vụ cuộc gọi. Vui lòng thử lại.',
    };
  }
  return {
    code: 'UNKNOWN',
    message: 'Không thể tạo cuộc gọi. Vui lòng thử lại.',
  };
}

export const openCallWindow = (callId: string, type: CallType) => {
  const width = 1000;
  const height = 700;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  const url = `/calls/${callId}?type=${type}`;
  window.open(
    url,
    `call-${callId}`,
    `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no`,
  );
};

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
    async (
      conversationId: string,
      type: CallType,
    ): Promise<StartCallResult> => {
      // Hard guard: prevent double-call
      if (isStartingCall.current) {
        console.warn('[Call] startCall already in progress, ignoring.');
        return {
          ok: false,
          code: 'UNKNOWN',
          message: 'Cuộc gọi đang được khởi tạo.',
        };
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

        const conversation = queryClient.getQueryData<ConversationDTO>(
          queryKeys.conversations.detail(conversationId),
        );
        const members = (conversation?.participants ?? []).map((id) => ({
          user_id: id,
        }));

        const isGroup = conversation?.isGroup;

        await call.getOrCreate({
          ring: !isGroup,
          data: {
            members,
            custom: { type },
          },
        });

        // Control camera AFTER room creation to avoid premature hardware spin-up
        if (type === CallType.AUDIO) {
          await call.camera.disable();
        } else {
          await call.camera.enable();
        }

        // control camera after
        if (isGroup) {
          setOutgoingCall({ conversationId, type, status: 'accepted' });
          openCallWindow(session.id, type);
        } else {
          setOutgoingCall({ conversationId, type, status: 'ringing' });
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
    [
      client,
      createCallSession,
      setActiveCall,
      setOutgoingCall,
      reset,
      queryClient,
    ],
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

      setActiveCall(incomingCall);
      setIncomingCall(null);

      // Open call window
      openCallWindow(incomingCall.id, incomingCall.type);
    } catch (error) {
      console.error('[Call] Failed to answer call:', error);
    }
  }, [
    acceptCallSession,
    joinCallSession,
    client,
    setActiveCall,
    setIncomingCall,
    incomingCall,
  ]);

  const rejectCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      if (!incomingCall.isGroupCall && client) {
        const call = client.call('default', incomingCall.id);
        void rejectCallSession(incomingCall.id).catch((e) =>
          console.warn('[Call] rejectCallSession error:', e),
        );
        void call
          .reject()
          .catch((e) => console.warn('[Call] call.reject error:', e));
      }
    } finally {
      setIncomingCall(null);
    }
  }, [incomingCall, client, rejectCallSession, setIncomingCall]);

  const endCall = useCallback(async () => {
    const callId = activeCall?.id;
    const isGroup = activeCall?.isGroupCall;

    // Reset store immediately so UI unblocks right away
    reset();

    if (!callId) return;

    if (client) {
      const call = client.call('default', callId);
      void call
        .leave()
        .catch((e) => console.warn('[Call] call.leave error:', e));
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

  const joinOngoingCall = useCallback(
    async (callId: string, defaultType: CallType = CallType.VIDEO) => {
      if (!client) return;
      try {
        let type = defaultType;
        let existingCall = queryClient.getQueryData<any>(
          queryKeys.calls.detail(callId),
        );

        if (!existingCall) {
          try {
            existingCall = await callService.getCallById(callId);
            if (existingCall) {
              queryClient.setQueryData(
                queryKeys.calls.detail(callId),
                existingCall,
              );
            }
          } catch (e) {
            console.warn(
              '[Call] Failed to fetch call details dynamically, using default type:',
              e,
            );
          }
        }

        if (existingCall?.type) {
          type = existingCall.type as CallType;
        }

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

        if (existingCall) {
          setActiveCall(existingCall);
        } else {
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

        openCallWindow(callId, type);
      } catch (error) {
        console.error('[Call] Failed to join ongoing call:', error);
      }
    },
    [client, joinCallSession, setActiveCall, queryClient],
  );

  return {
    startCall,
    answerCall,
    rejectCall,
    endCall,
    joinOngoingCall,
  };
}
