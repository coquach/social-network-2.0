'use client';

import { useCalls } from '@stream-io/video-react-sdk';
import { useCallActions, openCallWindow } from '@/hooks/use-call-actions';
import { useCallStore, useConversation, useUser, queryKeys, CallSessionStatus, CallType } from '@repo/shared';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { PhoneOff, ExternalLink, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useCallClient } from '@/providers/call-provider';
import { useSocket } from '@/components/providers/socket-provider';
import { useQueryClient } from '@tanstack/react-query';

export function CallOverlay() {
  const client = useCallClient();

  // Prevent rendering if we are in the dedicated call window
  if (
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/calls/')
  ) {
    return null;
  }

  if (!client) return null;

  return <CallOverlayInner />;
}

function CallOverlayInner() {
  const calls = useCalls();
  const queryClient = useQueryClient();
  const { chatSocket } = useSocket();
  const { userId } = useAuth();
  const client = useCallClient();
  const { endCall, answerCall, rejectCall } = useCallActions();
  const {
    activeCall: storeActiveCall,
    outgoingCall: storeOutgoingCall,
    incomingCall: storeIncomingCall,
    setIncomingCall,
    setActiveCall,
    setOutgoingCall,
    reset,
  } = useCallStore();

  useEffect(() => {
    if (!chatSocket || !userId) return;

    const handleCallInvite = async (payload: any) => {
      const callId = payload.id || payload._id;
      
      queryClient.setQueryData(queryKeys.calls.detail(callId), payload);
      queryClient.setQueryData(
        queryKeys.conversations.detail(payload.conversationId),
        (old: any) => old ? { ...old, activeCallId: callId } : old
      );

      if (payload.participants.includes(userId) && payload.initiatorId !== userId) {
        if (payload.status === CallSessionStatus.RINGING) {
          // Only show intrusive ringing modal for 1-to-1 calls
          if (!payload.isGroupCall) {
            setIncomingCall({ ...payload, id: callId });
          }
          
          if (client) {
            try {
              const call = client.call('default', callId);
              await call.get();
            } catch (err) {
              console.error('Failed to pre-fetch incoming call:', err);
            }
          }
        }
      }
    };

    const handleCallAccepted = async (payload: any) => {
      const { callId, conversationId, participants } = payload;
      queryClient.invalidateQueries({ queryKey: queryKeys.calls.detail(callId) });

      const currentState = useCallStore.getState();
      const currentOutgoing = currentState.outgoingCall;
      
      if (currentOutgoing && currentOutgoing.conversationId === conversationId) {
        setOutgoingCall({
          conversationId,
          type: currentOutgoing.type,
          status: 'accepted',
        });
        
        const activeCallSession = {
          _id: callId,
          id: callId,
          conversationId,
          initiatorId: userId || '',
          type: currentOutgoing.type,
          status: CallSessionStatus.ACCEPTED,
          participants: participants || [],
        };
        
        setActiveCall(activeCallSession);
        openCallWindow(callId, currentOutgoing.type as CallType, false);
      }

      // Cleanup incoming call if it matches the accepted call (e.g., accepted on another device)
      if (currentState.incomingCall?.id === callId || currentState.incomingCall?._id === callId) {
        setIncomingCall(null);
      }
    };

    const handleCallRejected = (payload: any) => {
      const { callId, conversationId } = payload;
      queryClient.invalidateQueries({ queryKey: queryKeys.calls.detail(callId) });
      
      queryClient.setQueryData(
        queryKeys.conversations.detail(conversationId),
        (old: any) => old ? { ...old, activeCallId: undefined } : old
      );

      const state = useCallStore.getState();
      if (
        state.incomingCall?.id === callId ||
        state.activeCall?.id === callId ||
        state.incomingCall?._id === callId ||
        state.activeCall?._id === callId ||
        state.outgoingCall?.conversationId === conversationId
      ) {
        reset();
      }
    };

    const handleCallEnded = (payload: any) => {
      const { callId, conversationId } = payload;
      queryClient.invalidateQueries({ queryKey: queryKeys.calls.detail(callId) });
      
      queryClient.setQueryData(
        queryKeys.conversations.detail(conversationId),
        (old: any) => old ? { ...old, activeCallId: undefined } : old
      );

      const state = useCallStore.getState();
      if (
        state.incomingCall?.id === callId ||
        state.activeCall?.id === callId ||
        state.incomingCall?._id === callId ||
        state.activeCall?._id === callId ||
        state.outgoingCall?.conversationId === conversationId
      ) {
        reset();
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
  }, [chatSocket, userId, client, queryClient, setIncomingCall, setOutgoingCall, setActiveCall, reset]);

  const targetCallId = storeActiveCall?.id || storeIncomingCall?.id;
  const currentCall = targetCallId
    ? calls.find((c) => c.id === targetCallId)
    : undefined;

  const isCallActive =
    !!storeActiveCall || !!storeIncomingCall || !!storeOutgoingCall;

  if (!isCallActive) return null;

  // 1. Connecting State Modal (Removed, handled by popup)


  // 2. Dialing (Outgoing) State Modal
  if (
    storeOutgoingCall &&
    (storeOutgoingCall.status === 'dialing' ||
      storeOutgoingCall.status === 'ringing') &&
    !currentCall
  ) {
    return (
      <Dialog open onOpenChange={() => endCall()}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md p-0 overflow-hidden border-none bg-neutral-950 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)]"
        >
          <DialingView
            onCancel={endCall}
            conversationId={storeOutgoingCall.conversationId}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // 3. Incoming Call Modal
  if (storeIncomingCall && !storeActiveCall) {
    return (
      <Dialog open onOpenChange={() => rejectCall()}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md p-0 overflow-hidden border-none bg-neutral-950 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)]"
        >
          <IncomingCallView
            onAccept={answerCall}
            onReject={rejectCall}
            conversationId={storeIncomingCall.conversationId}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // 4. Active Call Bar (Removed as per user request)
  if (storeActiveCall) {
    return null;
  }

  return null;
}

function IncomingCallView({ onAccept, onReject, conversationId }: any) {
  const { data: conversation } = useConversation(conversationId || '');
  const { userId } = useAuth();
  const isGroup = conversation?.isGroup;
  const otherParticipantId = conversation?.participants?.find(
    (p: string) => p !== userId,
  );
  const { data: otherUser } = useUser(otherParticipantId || '', {
    enabled: !isGroup && !!otherParticipantId,
  });

  const name =
    (isGroup
      ? conversation?.groupName
      : otherUser
        ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() ||
          'Người dùng'
        : 'Cuộc gọi đến...') || 'Cuộc gọi đến...';

  const avatarUrl = isGroup
    ? conversation?.groupAvatar?.url
    : otherUser?.avatarUrl;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-white min-h-[450px]">
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-full border-2 border-sky-500/20 flex items-center justify-center overflow-hidden bg-neutral-900 shadow-2xl ring-8 ring-sky-500/5">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={112}
              height={112}
              className="object-cover"
            />
          ) : (
            <div className="text-3xl font-bold text-neutral-600">
              {name.charAt(0)}
            </div>
          )}
        </div>
      </div>
      <h2 className="text-3xl font-bold mb-2 text-center tracking-tight">
        {name}
      </h2>
      <p className="text-neutral-500 mb-12 text-center tracking-[0.2em] uppercase text-[10px] font-black opacity-80">
        {isGroup ? 'Cuộc gọi nhóm đến...' : 'Đang gọi cho bạn...'}
      </p>

      <div className="flex gap-16 w-full justify-center">
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onReject}
            className="w-16 h-16 rounded-full bg-rose-600 flex items-center justify-center hover:bg-rose-700 transition shadow-[0_10px_30px_rgba(225,29,72,0.3)] active:scale-90 group"
          >
            <PhoneOff
              size={28}
              className="group-hover:-rotate-12 transition-transform"
            />
          </button>
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
            Từ chối
          </span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onAccept}
            className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center hover:bg-emerald-700 transition shadow-[0_10px_30px_rgba(16,185,129,0.3)] active:scale-90"
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center animate-pulse">
              <div className="w-4 h-4 bg-emerald-600 rounded-full" />
            </div>
          </button>
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
            Chấp nhận
          </span>
        </div>
      </div>
    </div>
  );
}

function DialingView({
  onCancel,
  conversationId,
}: {
  onCancel: () => void;
  conversationId?: string;
}) {
  const { data: conversation } = useConversation(conversationId || '');
  const { userId } = useAuth();
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const totalMs = 30000;
    const interval = 100;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += interval;
      const newProgress = Math.max(0, 1 - elapsed / totalMs);
      setProgress(newProgress);
      if (newProgress === 0) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const isGroup = conversation?.isGroup;
  const otherParticipantId = conversation?.participants?.find(
    (p: string) => p !== userId,
  );
  const { data: otherUser } = useUser(otherParticipantId || '', {
    enabled: !isGroup && !!otherParticipantId,
  });

  const avatarUrl = isGroup
    ? conversation?.groupAvatar?.url
    : otherUser?.avatarUrl;
  const name =
    (isGroup
      ? conversation?.groupName
      : otherUser
        ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() ||
          'Người dùng'
        : 'Đang kết nối...') || 'Đang kết nối...';

  const timeLeftSeconds = Math.ceil(progress * 30);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-white min-h-[550px]">
      <div className="relative mb-12">
        <div className="w-44 h-44 rounded-full border-4 border-rose-500/10 flex items-center justify-center overflow-hidden bg-neutral-900 shadow-2xl ring-[12px] ring-neutral-900">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={176}
              height={176}
              className="object-cover"
            />
          ) : (
            <div className="text-5xl font-bold text-neutral-600">
              {name.charAt(0)}
            </div>
          )}
        </div>
        <svg
          className="absolute -inset-2 -rotate-90 pointer-events-none"
          width="192"
          height="192"
        >
          <circle
            cx="96"
            cy="96"
            r="92"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-rose-500 transition-all duration-100 ease-linear"
            style={{
              strokeDasharray: 578,
              strokeDashoffset: 578 * (1 - progress),
            }}
          />
        </svg>
      </div>

      <h2 className="text-4xl font-bold mb-2 text-center tracking-tight">
        {name}
      </h2>
      <p className="text-neutral-500 text-xs mb-10 tracking-[0.3em] uppercase font-black opacity-70">
        Đang đổ chuông...
      </p>

      <div className="font-mono text-2xl text-neutral-400 bg-white/5 px-6 py-2 rounded-full border border-white/5 mb-16 shadow-inner">
        00:{timeLeftSeconds.toString().padStart(2, '0')}
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onCancel}
          className="w-20 h-20 rounded-full bg-rose-600 flex items-center justify-center hover:bg-rose-700 transition-all shadow-[0_15px_40px_rgba(225,29,72,0.4)] active:scale-90 group"
        >
          <PhoneOff
            size={36}
            className="group-hover:rotate-12 transition-transform duration-300"
          />
        </button>
        <span className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.2em] opacity-80">
          Hủy cuộc gọi
        </span>
      </div>
    </div>
  );
}
