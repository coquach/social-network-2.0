import { useAuth } from '@clerk/expo';
import {
  CallAcceptedPayload,
  CallEndedPayload,
  CallInvitePayload,
  CallRejectedPayload,
  CallSessionStatus,
  queryKeys,
  useCallStore,
  useJoinCall,
} from '@repo/shared';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef } from 'react';
import { useSocket } from '~/providers/socket-provider';
import { useCallClient } from '~/providers/call-provider';

export function CallRealtimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const { userId, isSignedIn } = useAuth();
  const { chatSocket } = useSocket();
  const client = useCallClient();
  const { setIncomingCall, setActiveCall, reset } = useCallStore();
  const { mutateAsync: joinCallSession } = useJoinCall();

  // Guard so caller only calls joinCallSession once per accepted call
  const joinedCallIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!chatSocket || !isSignedIn || !userId) {
      return;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // call.invite — emitted to all participants when a call.created event fires.
    // Only the callee shows the incoming call UI; initiator already has it set.
    // ──────────────────────────────────────────────────────────────────────────
    const handleCallInvite = async (payload: CallInvitePayload) => {
      const callId = payload.id || payload._id;
      queryClient.setQueryData(queryKeys.calls.detail(callId), payload);

      // Add active call indicator to conversation UI immediately
      queryClient.setQueryData(
        queryKeys.conversations.detail(payload.conversationId),
        (old: any) => (old ? { ...old, activeCallId: callId } : old),
      );

      if (
        payload.participants.includes(userId) &&
        payload.initiatorId !== userId
      ) {
        if (payload.status === CallSessionStatus.RINGING) {
          // Only ring and force incoming screen for 1-to-1 calls.
          // Group calls are just passively shown in the conversation UI.
          if (!payload.isGroupCall) {
            setIncomingCall({ ...payload, id: callId });
          }

          // Pre-fetch so the call registers in Stream useCalls()
          if (client) {
            try {
              const call = client.call('default', callId);
              await call.get();
            } catch (error) {
              console.error(
                '[CallRealtimeProvider] Pre-fetch incoming Stream call failed:',
                error,
              );
            }
          }
        }
      }
    };

    // ──────────────────────────────────────────────────────────────────────────
    // call.accepted — callee accepted, both sides need to join the call room.
    // ──────────────────────────────────────────────────────────────────────────
    const handleCallAccepted = async (payload: CallAcceptedPayload) => {
      const { callId } = payload;

      queryClient.invalidateQueries({
        queryKey: queryKeys.calls.detail(callId),
      });

      // Only the caller should automatically transition to ActiveCall and join the session
      const store = useCallStore.getState();
      const isCaller =
        store.outgoingCall &&
        (store.outgoingCall.id === callId ||
          (store.outgoingCall as any)._id === callId ||
          store.outgoingCall.conversationId === payload.conversationId);

      if (
        payload.userId !== userId &&
        isCaller &&
        !joinedCallIds.current.has(callId)
      ) {
        joinedCallIds.current.add(callId);
        void joinCallSession(callId).catch((e) =>
          console.warn(
            '[CallRealtimeProvider] joinCallSession (caller) error:',
            e,
          ),
        );

        const { type, conversationId } = store.outgoingCall!;

          setActiveCall({
            id: callId,
            _id: callId,
            conversationId,
            type,
            status: 'accepted',
            isGroupCall: false,
            participants: [],
            initiatorId: userId,
          } as any);
          useCallStore.setState({ outgoingCall: null });

          if (client) {
            const call = client.call('default', callId);
            call
              .join()
              .then(() => {
                if (type === 'audio') {
                  return call.camera.disable();
                } else {
                  return call.camera.enable();
                }
              })
              .then(() => {
                return call.microphone.enable();
              })
              .catch((e) =>
                console.error(
                  '[CallRealtimeProvider] Failed to join call upon acceptance:',
                  e,
                ),
              );
          }
      }

      // Cleanup incoming call if it matches the accepted call (e.g., accepted on another device)
      const currentState = useCallStore.getState();
      if (
        currentState.incomingCall?.id === callId ||
        currentState.incomingCall?._id === callId
      ) {
        setIncomingCall(null);
      }
    };

    // ──────────────────────────────────────────────────────────────────────────
    // call.rejected — callee rejected (or initiator cancelled)
    // ──────────────────────────────────────────────────────────────────────────
    const handleCallRejected = (payload: CallRejectedPayload) => {
      const { callId, conversationId } = payload;
      queryClient.invalidateQueries({
        queryKey: queryKeys.calls.detail(callId),
      });
      joinedCallIds.current.delete(callId);

      // Remove active call indicator from conversation UI immediately
      queryClient.setQueryData(
        queryKeys.conversations.detail(conversationId),
        (old: any) => (old ? { ...old, activeCallId: undefined } : old),
      );

      const { incomingCall, activeCall, outgoingCall } =
        useCallStore.getState();
      if (
        incomingCall?.id === callId ||
        activeCall?.id === callId ||
        incomingCall?._id === callId ||
        activeCall?._id === callId ||
        outgoingCall?.conversationId === conversationId
      ) {
        reset();
      }
    };

    // ──────────────────────────────────────────────────────────────────────────
    // call.ended — call finished (ENDED / MISSED / TIMEOUT)
    // ──────────────────────────────────────────────────────────────────────────
    const handleCallEnded = (payload: CallEndedPayload) => {
      const { callId, conversationId } = payload;
      queryClient.invalidateQueries({
        queryKey: queryKeys.calls.detail(callId),
      });
      joinedCallIds.current.delete(callId);

      // Remove active call indicator from conversation UI immediately
      queryClient.setQueryData(
        queryKeys.conversations.detail(conversationId),
        (old: any) => (old ? { ...old, activeCallId: undefined } : old),
      );

      const { incomingCall, activeCall, outgoingCall } =
        useCallStore.getState();
      if (
        incomingCall?.id === callId ||
        activeCall?.id === callId ||
        incomingCall?._id === callId ||
        activeCall?._id === callId ||
        outgoingCall?.conversationId === conversationId
      ) {
        reset();

        // Ensure Stream SDK also drops the call if it's active
        if (client) {
          try {
            const call = client.call('default', callId);
            call.leave().catch(console.warn);
          } catch (e) {
            console.warn(e);
          }
        }
      }
    };

    chatSocket.on('call.invite', handleCallInvite);
    chatSocket.on('call.accepted', handleCallAccepted);
    chatSocket.on('call.rejected', handleCallRejected);
    chatSocket.on('call.ended', handleCallEnded);

    return () => {
      chatSocket.off('call.invite', handleCallInvite);
      chatSocket.off('call.accepted', handleCallAccepted);
      chatSocket.off('call.rejected', handleCallRejected);
      chatSocket.off('call.ended', handleCallEnded);
    };
  }, [
    chatSocket,
    isSignedIn,
    userId,
    queryClient,
    client,
    setIncomingCall,
    setActiveCall,
    reset,
    joinCallSession,
  ]);

  return <>{children}</>;
}
