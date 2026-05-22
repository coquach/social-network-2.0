import React, { useEffect, useRef } from 'react';
import { View, Pressable } from 'react-native';
import {
  CallContent,
  CallingState,
  IncomingCall,
  RingingCallContent,
  StreamCall,
  useCalls,
} from '@stream-io/video-react-native-sdk';
import { CallType } from '@repo/shared';
import { useCallActions } from '~/hooks/use-call-actions';
import { useCallStore } from '~/store/call-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';


import { useCallClient } from '~/providers/call-provider';
import { AppTitle } from '../ui/app-text';

export function CallOverlay() {
  const client = useCallClient();
  if (!client) {
    return null;
  }
  return <CallOverlayInner />;
}

function CallOverlayInner() {
  const calls = useCalls();
  const { endCall, answerCall, rejectCall } = useCallActions();
  const { activeCall: storeActiveCall, outgoingCall: storeOutgoingCall, reset } = useCallStore();

  const isCleaningUp = useRef(false);

  const ringingCall = calls.find((c) => c.state.callingState === CallingState.RINGING);
  const activeCall = calls.find((c) => c.state.callingState === CallingState.JOINED);

  useEffect(() => {
    if (calls.length > 0) {
      isCleaningUp.current = false;
      return;
    }

    if (isCleaningUp.current) return;
    isCleaningUp.current = true;

    if (storeActiveCall || storeOutgoingCall) {
      endCall();
    } else {
      reset();
    }
  }, [calls.length]);

  if (storeOutgoingCall && (storeOutgoingCall.status === 'dialing' || storeOutgoingCall.status === 'ringing') && !ringingCall && !activeCall) {
    return <DialingOverlay onCancel={endCall} />;
  }

  if (ringingCall) {
    return (
      <StreamCall call={ringingCall}>
        <RingingCallContent 
          IncomingCall={(props) => (
            <IncomingCall 
              {...props}
              onAcceptCallHandler={answerCall}
              onRejectCallHandler={rejectCall}
            />
          )}
        />
      </StreamCall>
    );
  }

  if (activeCall) {
    return (
      <StreamCall call={activeCall}>
        <CallContent 
            onHangupCallHandler={endCall}
        />
      </StreamCall>
    );
  }

  return null;
}

function DialingOverlay({ onCancel }: { onCancel: () => void }) {
  return (
    <View className="absolute inset-0 z-[9999] items-center justify-center bg-[#1a1a1a]">
      <View className="items-center">
        <View className="mb-8 h-[120px] w-[120px] items-center justify-center rounded-full bg-[#333]">
           <MaterialCommunityIcons name="account" size={80} color="#666" />
        </View>
        <AppTitle className="mb-14 text-2xl font-semibold text-white">Đang kết nối...</AppTitle>
        
        <Pressable 
          className="h-[72px] w-[72px] items-center justify-center rounded-full bg-[#ff4444] shadow-lg active:opacity-80" 
          onPress={onCancel}
        >
          <MaterialCommunityIcons name="phone-hangup" size={32} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

