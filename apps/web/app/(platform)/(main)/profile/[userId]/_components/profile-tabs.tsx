'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

type ProfileTabId = 'posts' | 'friends' | 'shared';

interface ProfileTab {
  id: ProfileTabId;
  label: string;
  segment: string;
}

const TABS: ProfileTab[] = [
  {
    id: 'posts',
    label: 'Bài đăng',
    segment: '',
  },

  {
    id: 'shared',
    label: 'Đã chia sẻ',
    segment: '/shared',
  },
  {
    id: 'friends',
    label: 'Bạn bè',
    segment: '/friends',
  },
];

export const ProfileTabs = () => {
  const { userId } = useParams<{ userId: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const basePath = useMemo(() => {
    if (!userId) return '';
    return `/profile/${userId}`;
  }, [userId]);

  const handleTabClick = useCallback(
    (tab: ProfileTab) => {
      if (!basePath) return;
      const href = `${basePath}${tab.segment}`;
      if (href === pathname) return;
      router.push(href);
    },
    [basePath, pathname, router]
  );

  const getIsActive = (tab: ProfileTab) => {
    if (!basePath) return false;
    const href = `${basePath}${tab.segment}`;
    if (tab.id === 'posts') {
      return pathname === basePath;
    }
    return pathname === href;
  };

  return (
    <div className="border-t border-slate-100">
      <div className="border-b bg-white">
        <div className="px-4 md:px-6">
          <div className="overflow-x-auto">
            <ul className="flex min-w-max flex-nowrap space-x-6 md:space-x-8">
              {TABS.map((tab) => {
                const isActive = getIsActive(tab);

                return (
                  <li
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    className={[
                      'cursor-pointer whitespace-nowrap border-b-2 py-3 text-sm transition-colors md:py-4 md:text-base',
                      isActive
                        ? 'border-sky-500 text-sky-500 font-medium'
                        : 'border-transparent text-gray-600 hover:border-sky-500/90 hover:text-sky-500/90',
                    ].join(' ')}
                  >
                    {tab.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
