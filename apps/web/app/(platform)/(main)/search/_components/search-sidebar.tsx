'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Users, UserRound } from 'lucide-react';

import { GroupPrivacy } from '@/models/group/enums/group-privacy.enum';
import { ReactionType } from '@/models/social/enums/social.enum';
import { SearchGroupSortBy } from '@/lib/actions/search/search-actions';
import { SearchSidebarNavItem } from './sidebar-item';
import { SearchSidebarFilters } from './sidebar-filter';

type SearchType = 'posts' | 'groups' | 'users';
const SEARCH_TYPES: SearchType[] = ['posts', 'groups', 'users'];

export function SearchSidebar() {
  const router = useRouter();
  const params = useSearchParams();

  const paramType = params.get('type') as SearchType | null;
  const type: SearchType = SEARCH_TYPES.includes(paramType ?? 'posts')
    ? (paramType as SearchType)
    : 'posts';

  const emotion = (params.get('emotion') ?? '') as ReactionType | '';
  const privacy = (params.get('privacy') as GroupPrivacy) ?? '';
  const sortBy = (params.get('sortBy') as SearchGroupSortBy) ?? '';
  const isActive = params.get('isActive') ?? '';

  const patch = (obj: Record<string, string | undefined>) => {
    const p = new URLSearchParams(params.toString());
    Object.entries(obj).forEach(([k, v]) => (!v ? p.delete(k) : p.set(k, v)));
    router.replace(`/search?${p.toString()}`);
  };

  const changeType = (nextType: SearchType) => {
    // reset filters of other tabs to avoid stale params
    const reset =
      nextType === 'posts'
        ? {
            type: nextType,
            emotion: undefined,
            privacy: undefined,
            sortBy: undefined,
            isActive: undefined,
          }
        : nextType === 'groups'
        ? {
            type: nextType,
            privacy: undefined,
            sortBy: undefined,
            emotion: undefined,
            isActive: undefined,
          }
        : {
            type: nextType,
            isActive: undefined,
            emotion: undefined,
            privacy: undefined,
            sortBy: undefined,
          };

    patch(reset);
  };

  return (
    <div className="space-y-2">
      <SearchSidebarNavItem
        label="Bài viết"
        icon={FileText}
        active={type === 'posts'}
        onSelect={() => changeType('posts')}
      />
      {type === 'posts' && (
        <SearchSidebarFilters
          type={type}
          emotion={emotion}
          privacy={privacy}
          sortBy={sortBy}
          isActive={isActive}
          patch={patch}
        />
      )}

      <SearchSidebarNavItem
        label="Mọi người"
        icon={UserRound}
        active={type === 'users'}
        onSelect={() => changeType('users')}
      />
     

      <SearchSidebarNavItem
        label="Nhóm"
        icon={Users}
        active={type === 'groups'}
        onSelect={() => changeType('groups')}
      />
      {type === 'groups' && (
        <SearchSidebarFilters
          type={type}
          emotion={emotion}
          privacy={privacy}
          sortBy={sortBy}
          isActive={isActive}
          patch={patch}
        />
      )}
    </div>
  );
}
