'use client';

import { SidebarCustom } from '@/components/side-bar-custom';
import { useAuth } from '@clerk/nextjs';
import { Bell, ContactRound, Sparkles, Users, UserCircle } from 'lucide-react';
import { ContactList } from './_components/contact-list';
import { QuickLinksCard } from './_components/quick-links-card';

const NewsFeedLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { userId } = useAuth();
  return (
    <div className="grid grid-cols-4 w-full">
      <div className="w-1/4 h-full p-2 overflow-y-hidden fixed hidden sm:flex sm:flex-col justify-start ">
        <SidebarCustom
          items={[
            {
              label: 'Trang cá nhân',
              href: `/profile/${userId}`,
              icon: UserCircle,
            },
            {
              label: 'Bạn bè',
              href: '/friends',
              icon: ContactRound,
            },
            {
              label: 'Nhóm',
              href: '/groups',
              icon: Users,
            },
            {
              label: 'Thông báo',
              href: '/notifications',
              icon: Bell,
            },
            {
              label: 'Nhật ký cảm xúc',
              href: '/emotions',
              icon: Sparkles,
            },
          ]}
        />
      </div>

      <main className="col-span-4 sm:col-start-2 lg:col-start-2 sm:col-span-3 lg:col-span-2 px-8 overflow-y-auto">
        {children}
      </main>

      <div className="hidden lg:flex lg:flex-col lg:fixed lg:right-0 lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-1/4 pt-4 mr-4 overflow-hidden">
        <ContactList />
        <QuickLinksCard />
      </div>
    </div>
  );
};

export default NewsFeedLayout;
