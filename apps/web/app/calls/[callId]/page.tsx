'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  CallControls,
  CallingState,
  SpeakerLayout,
  StreamCall,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';
import { useCallClient } from '@/providers/call-provider';
import { useCallActions } from '@/hooks/use-call-actions';
import { Loader2, Users, Minimize2, Maximize2, X, Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CallPage() {
  const { callId } = useParams() as { callId: string };
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'video';
  
  const client = useCallClient();
  const [call, setCall] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client || !callId) return;

    const currentCall = client.call('default', callId);
    
    const initCall = async () => {
      try {
        // Automatically join the call
        await currentCall.join();
        
        // Sync media state based on call type
        if (type === 'audio') {
          await currentCall.camera.disable();
        } else {
          await currentCall.camera.enable();
        }
        
        // Always enable microphone by default for a new call
        await currentCall.microphone.enable();
        
        setCall(currentCall);
      } catch (err: any) {
        console.error('Failed to join call:', err);
        setError('Không thể tham gia cuộc gọi hoặc cuộc gọi đã kết thúc.');
      }
    };

    initCall();
  }, [client, callId, type]);

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold mb-4">{error}</h1>
        <button 
          onClick={() => window.close()}
          className="px-6 py-2 bg-sky-500 rounded-full font-medium hover:bg-sky-600 transition"
        >
          Đóng cửa sổ
        </button>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-sky-500 animate-spin" />
        <p className="text-neutral-400 font-medium">Đang thiết lập kết nối an toàn...</p>
      </div>
    );
  }

  return (
    <StreamCall call={call}>
      <CallViewContent />
    </StreamCall>
  );
}

function CallViewContent() {
  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const { endCall } = useCallActions();

  // Close window when call ends
  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      const timer = setTimeout(() => {
        window.close();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [callingState]);

  return (
    <div className="h-full flex flex-col relative group bg-neutral-950 select-none">
      {/* Messenger-style Immersive Header */}
      <div className="absolute top-0 left-0 right-0 z-30 p-8 flex justify-between items-start pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity duration-500">
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="bg-neutral-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl px-5 py-2.5 shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-2 duration-700">
             <div className="flex items-center gap-2.5 pr-4 border-r border-white/10">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] text-rose-500 uppercase leading-none">Live</span>
             </div>
             
             <div className="flex items-center gap-4">
                <CallTimer />
                <div className="h-3 w-[1px] bg-white/10" />
                <div className="flex items-center gap-2 text-neutral-300">
                   <Users className="h-3.5 w-3.5" />
                   <span className="text-[11px] font-bold tabular-nums leading-none">{participants.length}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Window Controls (Fake) */}
        <div className="flex gap-2 pointer-events-auto animate-in slide-in-from-top-2 duration-700 delay-100">
           <button 
             onClick={() => window.close()}
             className="h-10 w-10 flex items-center justify-center rounded-2xl bg-neutral-900/60 backdrop-blur-2xl border border-white/10 hover:bg-white/10 transition-all shadow-xl"
           >
             <X size={18} className="text-white/70" />
           </button>
        </div>
      </div>

      {/* Main Content: Video Grid / Speaker */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <div className="w-full h-full max-w-7xl mx-auto">
          <SpeakerLayout />
        </div>
      </div>

      {/* Floating Messenger Controls */}
      <div className="absolute bottom-12 left-0 right-0 z-30 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 pointer-events-none">
        <div className="pointer-events-auto bg-neutral-900/90 backdrop-blur-3xl px-10 py-5 rounded-[2.5rem] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.8)] flex items-center gap-8 ring-1 ring-white/5">
          <CustomCallControls 
            onLeave={() => {
              void endCall();
              window.close();
            }} 
          />
        </div>
      </div>
      
      {/* Corner Overlays for a cinematic feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none opacity-40" />
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.5)] pointer-events-none" />
    </div>
  );
}

function CallTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const format = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <span className="text-[11px] font-mono font-bold text-white/90 tabular-nums tracking-wider leading-none">
      {format(seconds)}
    </span>
  );
}

function CustomCallControls({ onLeave }: { onLeave: () => void }) {
  const call = useCall();
  const { useCameraState, useMicrophoneState, useScreenShareState } = useCallStateHooks();
  
  const { status: camStatus } = useCameraState();
  const { status: micStatus } = useMicrophoneState();
  const { status: screenStatus } = useScreenShareState();
  
  const isCamEnabled = camStatus === 'enabled';
  const isMicEnabled = micStatus === 'enabled';
  const isScreenEnabled = screenStatus === 'enabled';

  if (!call) return null;

  return (
    <div className="flex items-center gap-6">
      <button
        onClick={() => call.microphone.toggle()}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg",
          isMicEnabled 
            ? "bg-white/10 hover:bg-white/20 text-white" 
            : "bg-white text-black"
        )}
      >
        {isMicEnabled ? <Mic size={24} /> : <MicOff size={24} />}
      </button>

      <button
        onClick={() => call.camera.toggle()}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg",
          isCamEnabled 
            ? "bg-white/10 hover:bg-white/20 text-white" 
            : "bg-white text-black"
        )}
      >
        {isCamEnabled ? <Video size={24} /> : <VideoOff size={24} />}
      </button>

      <button
        onClick={() => call.screenShare.toggle()}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg",
          isScreenEnabled 
            ? "bg-sky-500 hover:bg-sky-400 text-white" 
            : "bg-white/10 hover:bg-white/20 text-white"
        )}
      >
        <MonitorUp size={24} />
      </button>

      <div className="w-[1px] h-8 bg-white/10 mx-2" />

      <button
        onClick={onLeave}
        className="w-16 h-12 rounded-[1.5rem] bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white transition-all duration-200 active:scale-95 shadow-lg shadow-rose-500/20"
      >
        <PhoneOff size={24} />
      </button>
    </div>
  );
}
