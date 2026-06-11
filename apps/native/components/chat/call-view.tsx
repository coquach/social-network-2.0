
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Svg, { Circle } from 'react-native-svg';
import {
  CallControls,
  CallingState,
  CallParticipantsList,
  IncomingCall,
  ParticipantView,
  RingingCallContent,
  StreamCall,
  useCalls,
  useCallStateHooks,
} from '@stream-io/video-react-native-sdk';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallActions } from '~/hooks/use-call-actions';
import { useCallClient } from '~/providers/call-provider';
import { useCallStore } from '~/store/call-store';
import { AppEyebrow, AppSubtitle, AppTitle } from '../ui/app-text';
import { useConversation, useUser } from '@repo/shared';
import { useAuth } from '@clerk/expo';

/**
 * Reusable Call View that handles different call states.
 * Used inside the dedicated Call Screen.
 */
export function CallView() {
  const client = useCallClient();
  if (!client) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0f0f0f]">
        <AppSubtitle className="text-white/60">Khởi tạo...</AppSubtitle>
      </View>
    );
  }
  return <CallViewInner />;
}

function CallViewInner() {
  const router = useRouter();
  const calls = useCalls();
  const { endCall, answerCall, rejectCall } = useCallActions();
  const {
    activeCall: storeActiveCall,
    outgoingCall: storeOutgoingCall,
    incomingCall: storeIncomingCall,
    autoAcceptCallId,
    setAutoAcceptCallId,
  } = useCallStore();

  // Auto-accept call if triggered from background/notification
  useEffect(() => {
    if (autoAcceptCallId && storeIncomingCall) {
      if (storeIncomingCall.id === autoAcceptCallId || storeIncomingCall._id === autoAcceptCallId) {
        setAutoAcceptCallId(null);
        void answerCall();
      }
    }
  }, [autoAcceptCallId, storeIncomingCall, answerCall, setAutoAcceptCallId]);


  // We strictly bind the Stream call to our Zustand store to ensure immediate UI updates
  // when the call is ended by the backend (which clears the store).
  const targetCallId = storeActiveCall?.id || storeIncomingCall?.id;
  const currentCall = targetCallId
    ? calls.find((c) => c.id === targetCallId)
    : undefined;

  // We no longer use a manual calls.length cleanup effect.
  // Real-time synchronization is handled purely by CallRealtimeProvider via socket events,
  // preventing race conditions where the calls array is momentarily empty during initialization.

  const isCallActiveInStore = !!storeActiveCall || !!storeIncomingCall || !!storeOutgoingCall;
  const [callEndedState, setCallEndedState] = useState(false);
  const wasActiveRef = React.useRef(isCallActiveInStore);

  useEffect(() => {
    if (wasActiveRef.current && !isCallActiveInStore) {
      // Call just ended
      setCallEndedState(true);
      const t = setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/chat');
        }
      }, 2500);
      return () => clearTimeout(t);
    }
    
    if (!wasActiveRef.current && !isCallActiveInStore && !callEndedState) {
      // Screen opened but no call is active, back out immediately
      const t = setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/chat');
        }
      }, 150);
      return () => clearTimeout(t);
    }
    
    wasActiveRef.current = isCallActiveInStore;
  }, [isCallActiveInStore, router, callEndedState]);

  if (
    storeOutgoingCall &&
    (storeOutgoingCall.status === 'dialing' ||
      storeOutgoingCall.status === 'ringing') &&
    !currentCall
  ) {
    return <DialingView onCancel={endCall} conversationId={storeOutgoingCall.conversationId} />;
  }

  if (callEndedState) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0f0f0f]">
        <View className="h-[140px] w-[140px] items-center justify-center rounded-full bg-[#2a2a2a] overflow-hidden mb-6">
          <MaterialIcons name="call-end" size={60} color="#f43f5e" />
        </View>
        <AppTitle className="mb-2 text-2xl font-bold text-white">
          Cuộc gọi đã kết thúc
        </AppTitle>
        <AppSubtitle className="text-white/50">
          Đang đóng...
        </AppSubtitle>
      </View>
    );
  }

  if (!isCallActiveInStore) {
    return null; // Render nothing while waiting for navigation to pop
  }

  if (!currentCall) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0f0f0f]">
        <AppSubtitle className="text-white/60">
          Đang kết nối...
        </AppSubtitle>
      </View>
    );
  }

  return (
    <StreamCall call={currentCall}>
      {currentCall.state.callingState === CallingState.RINGING ? (
        <RingingCallContent
          IncomingCall={(props) => (
            <IncomingCall
              {...props}
              onAcceptCallHandler={answerCall}
              onRejectCallHandler={rejectCall}
            />
          )}
        />
      ) : (
        <ActiveCallView
          onHangup={endCall}
          isGroupCall={
            storeActiveCall?.isGroupCall ??
            storeIncomingCall?.isGroupCall ??
            false
          }
        />
      )}
    </StreamCall>
  );
}

function ActiveCallView({
  onHangup,
  isGroupCall,
}: {
  onHangup: () => void;
  isGroupCall: boolean;
}) {
  const insets = useSafeAreaInsets();
  const { useParticipants, useCallCallingState } = useCallStateHooks();
  const participants = useParticipants();
  const callingState = useCallCallingState();
  const { setMinimized } = useCallStore();

  return (
    <View className="flex-1 bg-[#0f0f0f]">
      {/* Header info - Immersive overlay with top padding */}
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="z-10 absolute top-0 left-0 right-0 px-4"
      >
        <View className="flex-row items-center justify-between">
          {/* Status badge */}
          <View className="bg-black/50 px-3 py-1.5 rounded-full border border-white/10">
            <AppEyebrow className="text-white">
              {callingState === CallingState.JOINED
                ? '• TRỰC TIẾP'
                : '• ĐANG KẾT NỐI'}
            </AppEyebrow>
          </View>

          <View className="flex-row items-center gap-2">
            {isGroupCall && (
              <View className="bg-black/50 px-3 py-1.5 rounded-full border border-white/10">
                <AppEyebrow className="text-white">
                  {participants.length} THÀNH VIÊN
                </AppEyebrow>
              </View>
            )}
            {/* Minimize button */}
            <Pressable
              onPress={() => setMinimized(true)}
              className="bg-black/50 p-2 rounded-full border border-white/10 active:opacity-70"
            >
              <MaterialIcons name="zoom-in-map" size={20} color="white" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <View className="flex-1">
        {isGroupCall ? (
          <View style={{ flex: 1 }}>
            <CallParticipantsList participants={participants} />
          </View>
        ) : (
          <View className="flex-1">
            {participants.length > 1 ? (
              <>
                <View style={{ flex: 1 }}>
                  {(() => {
                    const remote =
                      participants.find((p) => !p.isLocalParticipant) ??
                      participants[0];
                    return remote ? (
                      <ParticipantView participant={remote} style={{ flex: 1 }} />
                    ) : null;
                  })()}
                </View>
                {(() => {
                  const local = participants.find((p) => p.isLocalParticipant);
                  return local ? (
                    <View className="absolute bottom-40 right-4 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
                      <ParticipantView participant={local} style={{ flex: 1 }} />
                    </View>
                  ) : null;
                })()}
              </>
            ) : participants[0] ? (
              <View style={{ flex: 1 }}>
                <ParticipantView participant={participants[0]} style={{ flex: 1 }} />
              </View>
            ) : (
              <View className="flex-1 items-center justify-center">
                <AppSubtitle className="text-white/50">Đang chờ kết nối...</AppSubtitle>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Bottom Controls - Positioned with safe area bottom padding */}
      <View
        style={{ paddingBottom: insets.bottom + 20 }}
        className="absolute bottom-0 left-0 right-0 items-center"
      >
        <View className="bg-black/60 px-6 py-4 rounded-full flex-row items-center border border-white/10 shadow-2xl">
          <CallControls onHangupCallHandler={onHangup} />
        </View>
      </View>
    </View>
  );
}

function DialingView({ onCancel, conversationId }: { onCancel: () => void; conversationId?: string }) {
  const insets = useSafeAreaInsets();
  const { data: conversation } = useConversation(conversationId || '');
  const { userId } = useAuth();
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const totalMs = 30000; // 30 seconds
    const interval = 50; // update every 50ms for smooth animation
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const newProgress = Math.max(0, 1 - elapsed / totalMs);
      setProgress(newProgress);
      if (newProgress === 0) {
        clearInterval(timer);
      }
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const isGroup = conversation?.isGroup;
  
  // Lấy ID của người kia (nếu gọi 1-1)
  const otherParticipantId = conversation?.participants?.find((p: string) => p !== userId);
  
  // Dùng useUser để fetch thông tin chi tiết của người kia
  const { data: otherUser } = useUser(otherParticipantId || '', { enabled: !isGroup && !!otherParticipantId });
  
  const avatarUrl = isGroup ? conversation?.groupAvatar?.url : otherUser?.avatarUrl;
  const name = isGroup 
    ? conversation?.groupName 
    : otherUser 
      ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || 'Người dùng'
      : 'Đang kết nối...';

  const timeLeftSeconds = Math.ceil(progress * 30);
  
  // Thông số cho vòng SVG
  const size = 180;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View
      style={{ paddingBottom: insets.bottom + 60, paddingTop: insets.top }}
      className="flex-1 items-center justify-center bg-[#0f0f0f]"
    >
      <View className="items-center">
        <View className="mb-10 relative items-center justify-center" style={{ width: size, height: size }}>
          <Svg width={size} height={size} className="absolute">
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#f43f5e"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>
          
          <View className="h-[140px] w-[140px] items-center justify-center rounded-full bg-[#2a2a2a] overflow-hidden">
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <MaterialIcons name="account-circle" size={100} color="#888" />
            )}
          </View>
        </View>

        <AppTitle className="mb-2 text-2xl font-bold text-white">
          {name}
        </AppTitle>
        <AppSubtitle className="mb-2 text-white/50">
          Đang đổ chuông...
        </AppSubtitle>
        
        <AppSubtitle className="mb-20 text-white/30 text-sm font-mono tracking-widest mt-2">
          00:{timeLeftSeconds.toString().padStart(2, '0')}
        </AppSubtitle>

        <View className="items-center">
          <Pressable
            className="h-[80px] w-[80px] items-center justify-center rounded-full bg-rose-500 shadow-2xl active:bg-rose-600 active:scale-95 transition-all"
            onPress={onCancel}
          >
            <MaterialCommunityIcons
              name="phone-hangup"
              size={40}
              color="white"
            />
          </Pressable>
          <AppSubtitle className="mt-4 text-white/60 font-medium uppercase tracking-widest text-[10px]">
            Hủy bỏ
          </AppSubtitle>
        </View>
      </View>
    </View>
  );
}
