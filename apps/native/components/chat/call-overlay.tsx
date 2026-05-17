import React, { useEffect } from 'react';
import {
  CallContent,
  CallingState,
  RingingCallContent,
  StreamCall,
  useCalls,
} from '@stream-io/video-react-native-sdk';
import { useCallActions } from '~/hooks/use-call-actions';
import { useCallStore } from '~/store/call-store';

export function CallOverlay() {
  const calls = useCalls();
  const { endCall } = useCallActions();
  const { reset } = useCallStore();

  // Find a call that is currently ringing (incoming or outgoing)
  const ringingCall = calls.find((c) => c.state.callingState === CallingState.RINGING);
  // Find a call that is active (joined)
  const activeCall = calls.find((c) => c.state.callingState === CallingState.JOINED);

  // Sync Stream call ending with our backend and store
  useEffect(() => {
    if (calls.length === 0) {
      reset();
    }
  }, [calls.length, reset]);

  if (ringingCall) {
    return (
      <StreamCall call={ringingCall}>
        <RingingCallContent />
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
