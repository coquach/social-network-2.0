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

export const openCallWindow = (callId: string, type: CallType, isGroup: boolean, conversationId?: string, isCaller?: boolean) => {
  const width = 1000;
  const height = 700;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  let url = `/calls/${callId}?type=${type}&isGroup=${isGroup}`;
  if (conversationId) url += `&conversationId=${conversationId}`;
  if (isCaller) url += `&isCaller=${isCaller}`;

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
    outgoingCall,
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

        // control camera after
        setOutgoingCall({ conversationId, type, status: 'accepted' });
        openCallWindow(session.id, type, isGroup || false, conversationId, true);

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

      // Notify BE so Redis group-online-set stays accurate
      void joinCallSession(incomingCall.id).catch((e) =>
        console.warn('[Call] joinCallSession error:', e),
      );

      setActiveCall(incomingCall);
      setIncomingCall(null);

      // Open call window
      openCallWindow(incomingCall.id, incomingCall.type as CallType, incomingCall.isGroupCall || false, incomingCall.conversationId, false);
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

  const endCall = useCallback(async (explicitCallId?: string, explicitIsGroup?: boolean) => {
    const callId = explicitCallId || activeCall?.id || activeCall?._id || outgoingCall?.conversationId;
    const isGroup = explicitIsGroup !== undefined ? explicitIsGroup : activeCall?.isGroupCall;

    // Reset store immediately so UI unblocks right away
    reset();

    if (!callId) return;

    if (client) {
      const call = client.call('default', callId);
      if (isGroup) {
        void call
          .leave()
          .catch((e) => console.warn('[Call] call.leave error:', e));
      } else {
        void call
          .endCall()
          .catch((e) => console.warn('[Call] call.endCall error:', e));
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
  }, [activeCall, outgoingCall, client, endCallSession, leaveCallSession, reset]);

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

        void joinCallSession(callId).catch((e) =>
          console.warn('[Call] joinCallSession error:', e),
        );

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

        const isGroup = existingCall ? existingCall.isGroupCall : true;
        openCallWindow(callId, type, isGroup || false, existingCall?.conversationId, false);
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
