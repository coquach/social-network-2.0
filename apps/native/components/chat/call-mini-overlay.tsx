import React, { useRef } from 'react';
import { View, Pressable, PanResponder, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CallingState,
  StreamCall,
  ParticipantView,
  useCalls,
  useCallStateHooks,
} from '@stream-io/video-react-native-sdk';
import { useCallStore } from '~/store/call-store';
import { useCallActions } from '~/hooks/use-call-actions';
import { useCallClient } from '~/providers/call-provider';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { AppEyebrow } from '../ui/app-text';

const OVERLAY_WIDTH = 160;
const OVERLAY_HEIGHT = 100;

import { useRouter, usePathname } from 'expo-router';

/**
 * Floating mini call overlay shown when user minimizes the call or navigates away.
 * Tap → restore full screen. Drag to reposition.
 */
export function CallMiniOverlay() {
  const client = useCallClient();
  const { isMinimized, activeCall: storeActiveCall } = useCallStore();
  const pathname = usePathname();

  const isCallScreen = pathname?.includes('/chat/call');
  const shouldShow = storeActiveCall && (isMinimized || !isCallScreen);

  if (!client || !shouldShow) return null;

  return <CallMiniOverlayInner isCallScreen={isCallScreen} activeCallId={storeActiveCall.id} />;
}

function CallMiniOverlayInner({ isCallScreen, activeCallId }: { isCallScreen?: boolean, activeCallId: string }) {
  const insets = useSafeAreaInsets();
  const calls = useCalls();
  const { endCall } = useCallActions();
  const { setMinimized } = useCallStore();

  const currentCall = calls.find(
    (c) => c.state.callingState === CallingState.JOINED,
  );

  // Draggable position
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > 4 || Math.abs(dy) > 4,
      onPanResponderGrant: () => {
        pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    }),
  ).current;

  const router = useRouter();

  const handleExpand = () => {
    setMinimized(false);
    if (!isCallScreen) {
      router.push(`/chat/call`);
    }
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: insets.bottom + 16 + 80, // above tab bar
          right: 16,
          width: OVERLAY_WIDTH,
          height: OVERLAY_HEIGHT,
          zIndex: 9998,
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Pressable onPress={handleExpand} style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            borderRadius: 16,
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.15)',
            backgroundColor: '#1a1a1a',
          }}
        >
          {currentCall ? (
            <StreamCall call={currentCall}>
              <MiniParticipantView />
            </StreamCall>
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="phone-in-talk" size={28} color="#4ade80" />
              <AppEyebrow className="text-white/70 mt-1 text-[10px]">Đang gọi</AppEyebrow>
            </View>
          )}

          {/* Overlay controls */}
          <View
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              flexDirection: 'row',
              gap: 4,
            }}
          >
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                endCall();
              }}
              style={{
                backgroundColor: 'rgba(239,68,68,0.85)',
                borderRadius: 99,
                padding: 4,
              }}
              hitSlop={8}
            >
              <MaterialCommunityIcons name="phone-hangup" size={12} color="white" />
            </Pressable>
          </View>

          {/* Expand icon hint */}
          <View
            style={{
              position: 'absolute',
              bottom: 4,
              left: 6,
            }}
          >
            <MaterialIcons name="zoom-out-map" size={12} color="rgba(255,255,255,0.5)" />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function MiniParticipantView() {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const remoteParticipant = participants.find((p) => !p.isLocalParticipant) ?? participants[0];

  if (!remoteParticipant) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name="phone-in-talk" size={24} color="#4ade80" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ParticipantView participant={remoteParticipant} style={{ flex: 1 }} />
    </View>
  );
}
