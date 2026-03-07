'use client';

import { useGroupPermissionContext } from '@/contexts/group-permission-context';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { GroupRole } from '@/models/group/enums/group-role.enum';

type GroupTabId = 'discussion' | 'members' | 'admin';

interface GroupTab {
  id: GroupTabId;
  label: string;
  /** đường dẫn tương đối sau /groups/[groupId] */
  segment: string;
}

const TABS: GroupTab[] = [
  {
    id: 'discussion',
    label: 'Tranh luận',
    segment: '',
    // mọi member đều thấy
  },
  {
    id: 'members',
    label: 'Thành viên',
    segment: '/members',
    // chỉ xem danh sách thành viên → không cần quyền đặc biệt
  },
  {
    id: 'admin',
    label: 'Quản trị',
    segment: '/admin',
    // dùng cho duyệt bài + report
  },
];

export const GroupTabs = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useGroupPermissionContext();

  const basePath = useMemo(() => {
    if (!groupId) return '';
    return `/groups/${groupId}`;
  }, [groupId]);

  const handleTabClick = useCallback(
    (tab: GroupTab) => {
      if (!basePath) return;
      const href = `${basePath}${tab.segment}`;
      if (href === pathname) return;
      router.push(href);
    },
    [basePath, pathname, router]
  );

  const getIsActive = (tab: GroupTab) => {
    if (!basePath) return false;
    const href = `${basePath}${tab.segment}`;

    // Tab "Tranh luận" là mặc định: active khi đang ở /groups/[groupId]
    if (tab.id === 'discussion') {
      return pathname === basePath;
    }

    return pathname === href;
  };

  const visibleTabs = useMemo(() => {
    return TABS.filter((tab) => {
      if (tab.id === 'admin') {
        return !!role && role !== GroupRole.MEMBER;
      }
      return true;
    });
  }, [role]);

  return (
    <div className="border-b bg-white">
      <div className="px-4 md:px-6">
        <div className="overflow-x-auto">
          <ul className="flex flex-nowrap space-x-6 md:space-x-8 min-w-max">
            {visibleTabs.map((tab) => {
              const isActive = getIsActive(tab);

              return (
                <li
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={[
                    'py-3 md:py-4 text-sm md:text-base cursor-pointer border-b-2 transition-colors whitespace-nowrap',
                    isActive
                      ? 'text-sky-500 border-sky-500 font-medium'
                      : 'text-gray-600 border-transparent hover:text-sky-500/90 hover:border-sky-500/90',
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
  );
};



