import { useEffect, useRef } from 'react';
import { useCallStore } from '~/store/call-store';
import { useRouter, useSegments } from 'expo-router';

/**
 * Invisible component that monitors call state and navigates to/from the Call Screen.
 * Placed in the Root Layout.
 *
 * Rules:
 *  - Call active + NOT minimized + NOT on call screen → push /chat/call
 *  - Minimized (user hit "shrink") + on call screen → go back (reveal previous screen)
 *  - No call at all → do nothing (CallViewInner handles its own back())
 */
export function CallManager() {
  const router = useRouter();
  const segments = useSegments() as string[];
  const { activeCall, incomingCall, outgoingCall, isMinimized } = useCallStore();

  // Prevent double-navigation during the same render cycle
  const didNavigateRef = useRef(false);

  useEffect(() => {
    didNavigateRef.current = false;
  });

  useEffect(() => {
    const isCallActive = !!activeCall || !!incomingCall || !!outgoingCall;
    const isOnCallScreen =
      segments.length >= 2 && segments[0] === 'chat' && segments[1] === 'call';

    // User pressed "Minimize" while on the call screen → go back
    if (isMinimized && isOnCallScreen) {
      router.back();
      return;
    }

    // Removed: We no longer auto-navigate back when call ends.
    // Instead, CallView renders a "Call Ended" screen with a back button.

    // Call became active (or un-minimized) and we're not on the call screen yet → push
    if (isCallActive && !isMinimized && !isOnCallScreen) {
      console.log('[CallManager] Navigating to call screen...');
      router.push('/chat/call');
    }
  }, [activeCall, incomingCall, outgoingCall, isMinimized, segments, router]);

  return null;
}
