'use client';

import {
  useCalls,
} from '@stream-io/video-react-sdk';
import { useCallActions } from '@/hooks/use-call-actions';
import { useCallStore, useConversation, useUser } from '@repo/shared';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { PhoneOff, ExternalLink, Loader2 } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { useCallClient } from '@/providers/call-provider';

export function CallOverlay() {
  const client = useCallClient();

  // Prevent rendering if we are in the dedicated call window
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/calls/')) {
    return null;
  }

  if (!client) return null;

  return <CallOverlayInner />;
}

function CallOverlayInner() {
  const calls = useCalls();
  const { endCall, answerCall, rejectCall } = useCallActions();
  const {
    activeCall: storeActiveCall,
    outgoingCall: storeOutgoingCall,
    incomingCall: storeIncomingCall,
  } = useCallStore();

  const targetCallId = storeActiveCall?.id || storeIncomingCall?.id;
  const currentCall = targetCallId
    ? calls.find((c) => c.id === targetCallId)
    : undefined;

  const isCallActive = !!storeActiveCall || !!storeIncomingCall || !!storeOutgoingCall;

  if (!isCallActive) return null;

  // 1. Connecting State Modal
  if (!currentCall && !storeIncomingCall && !storeOutgoingCall && storeActiveCall) {
    return (
      <Dialog open>
        <DialogContent showCloseButton={false} className="max-w-xs p-8 bg-neutral-900 border-white/10 text-white flex flex-col items-center gap-4 rounded-3xl">
           <div className="relative">
              <Loader2 className="h-12 w-12 text-sky-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="h-2 w-2 bg-sky-500 rounded-full animate-pulse" />
              </div>
           </div>
           <p className="text-sm font-bold tracking-tight animate-pulse text-neutral-300">Đang thiết lập cuộc gọi...</p>
        </DialogContent>
      </Dialog>
    );
  }

  // 2. Dialing (Outgoing) State Modal
  if (storeOutgoingCall && (storeOutgoingCall.status === 'dialing' || storeOutgoingCall.status === 'ringing') && !currentCall) {
    return (
      <Dialog open onOpenChange={() => endCall()}>
        <DialogContent showCloseButton={false} className="max-w-md p-0 overflow-hidden border-none bg-neutral-950 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)]">
          <DialingView onCancel={endCall} conversationId={storeOutgoingCall.conversationId} />
        </DialogContent>
      </Dialog>
    );
  }

  // 3. Incoming Call Modal
  if (storeIncomingCall && !storeActiveCall) {
    return (
      <Dialog open onOpenChange={() => rejectCall()}>
        <DialogContent showCloseButton={false} className="max-w-md p-0 overflow-hidden border-none bg-neutral-950 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)]">
           <IncomingCallView 
              onAccept={answerCall}
              onReject={rejectCall}
              conversationId={storeIncomingCall.conversationId}
           />
        </DialogContent>
      </Dialog>
    );
  }

  // 4. Active Call Bar (Messenger style floating at the bottom)
  if (storeActiveCall) {
    return (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] animate-in fade-in slide-in-from-bottom-6 duration-500">
        <div className="bg-sky-600/90 backdrop-blur-2xl text-white px-7 py-3 rounded-full shadow-[0_15px_40px_rgba(14,165,233,0.3)] border border-white/20 flex items-center gap-6 ring-4 ring-sky-500/10">
          <div className="flex items-center gap-3">
            <div className="relative flex h-2.5 w-2.5">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </div>
            <span className="text-sm font-bold tracking-tight whitespace-nowrap">Cuộc gọi đang diễn ra</span>
          </div>
          
          <div className="h-5 w-[1px] bg-white/20" />
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const width = 1000;
                const height = 700;
                const left = window.screen.width / 2 - width / 2;
                const top = window.screen.height / 2 - height / 2;
                window.open(
                  `/calls/${storeActiveCall.id}`, 
                  `call-${storeActiveCall.id}`, 
                  `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no`
                );
              }}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] hover:bg-white/10 px-3 py-1.5 rounded-full transition-all active:scale-95"
            >
              Xem cửa sổ <ExternalLink size={14} />
            </button>
            <button 
              onClick={() => endCall()}
              className="text-xs font-black uppercase tracking-[0.1em] bg-rose-500 hover:bg-rose-600 px-4 py-1.5 rounded-full transition-all shadow-lg active:scale-95"
            >
              Kết thúc
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function IncomingCallView({ onAccept, onReject, conversationId }: any) {
  const { data: conversation } = useConversation(conversationId || '');
  const { userId } = useAuth();
  const otherParticipantId = conversation?.participants?.find((p: string) => p !== userId);
  const { data: otherUser } = useUser(otherParticipantId || '', { enabled: !!otherParticipantId });
  
  const name = (conversation?.isGroup 
    ? conversation?.groupName 
    : otherUser 
      ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || 'Người dùng'
      : 'Cuộc gọi đến...') || 'Cuộc gọi đến...';

  return (
    <div className="flex flex-col items-center justify-center p-12 text-white min-h-[450px]">
      <div className="w-28 h-28 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center mb-8 animate-pulse ring-8 ring-sky-500/5">
        <div className="w-20 h-20 rounded-full bg-sky-500 flex items-center justify-center shadow-[0_0_40px_rgba(14,165,233,0.4)]">
          <Image src="/logo.svg" alt="Incoming Call" width={50} height={50} />
        </div>
      </div>
      <h2 className="text-3xl font-bold mb-2 text-center tracking-tight">{name}</h2>
      <p className="text-neutral-500 mb-12 text-center tracking-[0.2em] uppercase text-[10px] font-black opacity-80">Đang gọi cho bạn...</p>
      
      <div className="flex gap-16 w-full justify-center">
        <div className="flex flex-col items-center gap-3">
          <button 
            onClick={onReject}
            className="w-16 h-16 rounded-full bg-rose-600 flex items-center justify-center hover:bg-rose-700 transition shadow-[0_10px_30px_rgba(225,29,72,0.3)] active:scale-90 group"
          >
            <PhoneOff size={28} className="group-hover:-rotate-12 transition-transform" />
          </button>
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Từ chối</span>
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
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Chấp nhận</span>
        </div>
      </div>
    </div>
  );
}

function DialingView({ onCancel, conversationId }: { onCancel: () => void; conversationId?: string }) {
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
  const otherParticipantId = conversation?.participants?.find((p: string) => p !== userId);
  const { data: otherUser } = useUser(otherParticipantId || '', { enabled: !isGroup && !!otherParticipantId });
  
  const avatarUrl = isGroup ? conversation?.groupAvatar?.url : otherUser?.avatarUrl;
  const name = (isGroup 
    ? conversation?.groupName 
    : otherUser 
      ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || 'Người dùng'
      : 'Đang kết nối...') || 'Đang kết nối...';

  const timeLeftSeconds = Math.ceil(progress * 30);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-white min-h-[550px]">
      <div className="relative mb-12">
        <div className="w-44 h-44 rounded-full border-4 border-rose-500/10 flex items-center justify-center overflow-hidden bg-neutral-900 shadow-2xl ring-[12px] ring-neutral-900">
           {avatarUrl ? (
             <Image src={avatarUrl} alt={name} width={176} height={176} className="object-cover" />
           ) : (
             <div className="text-5xl font-bold text-neutral-600">{name.charAt(0)}</div>
           )}
        </div>
        <svg className="absolute -inset-2 -rotate-90 pointer-events-none" width="192" height="192">
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
      
      <h2 className="text-4xl font-bold mb-2 text-center tracking-tight">{name}</h2>
      <p className="text-neutral-500 text-xs mb-10 tracking-[0.3em] uppercase font-black opacity-70">Đang đổ chuông...</p>
      
      <div className="font-mono text-2xl text-neutral-400 bg-white/5 px-6 py-2 rounded-full border border-white/5 mb-16 shadow-inner">
        00:{timeLeftSeconds.toString().padStart(2, '0')}
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <button 
          onClick={onCancel}
          className="w-20 h-20 rounded-full bg-rose-600 flex items-center justify-center hover:bg-rose-700 transition-all shadow-[0_15px_40px_rgba(225,29,72,0.4)] active:scale-90 group"
        >
          <PhoneOff size={36} className="group-hover:rotate-12 transition-transform duration-300" />
        </button>
        <span className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.2em] opacity-80">Hủy cuộc gọi</span>
      </div>
    </div>
  );
}
