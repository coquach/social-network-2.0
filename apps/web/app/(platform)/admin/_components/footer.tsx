'use client';

import { UserButton, SignOutButton, useUser } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SidebarUserFooter() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="px-3 py-3">
        <div className="h-14 rounded-xl border border-sky-100 bg-white/70" />
      </div>
    );
  }

  const name =
    user?.fullName ||
    'Người dùng';

  return (
    <div className="px-3 py-3">
      <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white p-3">
        {/* Avatar */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'h-9 w-9',
            },
          }}
        />

        {/* User info */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-slate-800">
            {name}
          </div>
          <div className="text-xs text-slate-500">Tài khoản</div>
        </div>

        {/* Sign out */}
        <SignOutButton>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-500 hover:text-rose-500 hover:bg-rose-100"
            aria-label="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </SignOutButton>
      </div>
    </div>
  );
}
