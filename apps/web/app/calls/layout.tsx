'use client';

import { ReactNode } from 'react';

export default function CallLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-full bg-neutral-950 overflow-hidden text-white">
      {children}
    </div>
  );
}
