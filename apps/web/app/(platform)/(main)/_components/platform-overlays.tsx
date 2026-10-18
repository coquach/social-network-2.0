'use client';

import dynamic from 'next/dynamic';

// Heavy client-only overlays — dynamically imported with ssr: false
// ChatBox depends on socket.io-client; CallOverlay depends on Stream Video SDK
const ChatBox = dynamic(
  () => import('./chat-box').then((m) => ({ default: m.ChatBox })),
  { ssr: false }
);

const CallOverlay = dynamic(
  () => import('@/components/chat/call-overlay').then((m) => ({ default: m.CallOverlay })),
  { ssr: false }
);

export function PlatformOverlays() {
  return (
    <>
      <aside aria-label="Chat bot">
        <ChatBox />
      </aside>
      <CallOverlay />
    </>
  );
}
