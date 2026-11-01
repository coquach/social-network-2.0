'use client';

import dynamic from 'next/dynamic';

const AssistantSheet = dynamic(
  () =>
    import('@/components/chatbot/assistant-sheet').then((m) => ({
      default: m.AssistantSheet,
    })),
  { ssr: false }
);

const CallOverlay = dynamic(
  () =>
    import('@/components/chat/call-overlay').then((m) => ({
      default: m.CallOverlay,
    })),
  { ssr: false }
);

export function PlatformOverlays() {
  return (
    <>
      <AssistantSheet />
      <CallOverlay />
    </>
  );
}
