'use client';

import React from 'react';
import { useCrisisStore } from '@repo/shared';

const RESOURCES = [
  { name: 'Đường dây nóng Ngày Mai', phone: '1900 599 830' },
  { name: 'Tổng đài Quốc gia', phone: '111' },
];

/** Dev-only panel to trigger mock UI states without running the full flow. */
export const UIDevTools = () => {
  const { triggerCrisis, dismissCrisis } = useCrisisStore();

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-4 left-4 z-[10000] flex flex-col gap-2 rounded-lg border bg-white/90 p-3 text-xs shadow-lg backdrop-blur">
      <span className="font-bold">UI Dev Tools</span>
      <button
        className="rounded bg-rose-600 px-2 py-1 text-white"
        onClick={() => triggerCrisis({ severity: 'high', resources: RESOURCES, notificationSent: true })}
      >
        Crisis banner (high)
      </button>
      <button
        className="rounded bg-red-500 px-2 py-1 text-white"
        onClick={() => triggerCrisis({ severity: 'medium', resources: [], notificationSent: true })}
      >
        Toast (medium)
      </button>
      <button className="rounded bg-gray-200 px-2 py-1" onClick={dismissCrisis}>
        Dismiss
      </button>
    </div>
  );
};
