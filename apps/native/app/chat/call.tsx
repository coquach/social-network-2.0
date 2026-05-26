import React from 'react';
import { AppScreen } from '~/components/ui/app-screen';
import { CallView } from '~/components/chat/call-view';

export default function CallScreen() {
  return (
    <AppScreen className="px-0 py-0">
      <CallView />
    </AppScreen>
  );
}
