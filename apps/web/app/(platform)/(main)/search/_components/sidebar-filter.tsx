'use client';

import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { GroupPrivacy } from '@/models/group/enums/group-privacy.enum';
import { ReactionType } from '@/models/social/enums/social.enum';
import { SearchGroupSortBy } from '@/lib/actions/search/search-actions';
import { reactionsUI } from '@/lib/types/reaction';

type SearchType = 'posts' | 'groups' | 'users';

export function SearchSidebarFilters({
  type,
  emotion,
  privacy,
  sortBy,
  isActive,
  patch,
}: {
  type?: SearchType;
  emotion?: ReactionType | '';
  privacy?: GroupPrivacy | '';
  sortBy?: SearchGroupSortBy | '';
  isActive?: string;
  patch: (obj: Record<string, string | undefined>) => void;
}) {
  if (type === 'posts') {
    return (
      <div className="pl-2 pt-2">
        <Collapsible defaultOpen title="Cảm xúc">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between px-2">
              Cảm xúc
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-2 px-2">
            <div className="flex flex-wrap gap-2">
              {reactionsUI.map((r) => {
                const active = emotion === r.type;
                return (
                  <Button
                    key={r.type}
                    size="sm"
                    variant={active ? 'default' : 'secondary'}
                    className="h-8 rounded-full"
                    onClick={() =>
                      patch({ emotion: active ? undefined : String(r.type) })
                    }
                  >
                    <span className={r.color}>{r.emoji}</span>
                    <span className="ml-2">{r.name}</span>
                  </Button>
                );
              })}
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => patch({ emotion: undefined })}
            >
              Đặt lại
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  if (type === 'groups') {
    return (
      <div className="pl-2 pt-2 space-y-3">
        <Collapsible defaultOpen title="Chế độ riêng tư">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between px-2">
              Chế độ riêng tư
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 px-2 flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={!privacy ? 'default' : 'secondary'}
              onClick={() => patch({ privacy: undefined })}
            >
              Tất cả
            </Button>
            <Button
              size="sm"
              variant={
                privacy === GroupPrivacy.PUBLIC ? 'default' : 'secondary'
              }
              onClick={() => patch({ privacy: GroupPrivacy.PUBLIC })}
            >
              Công khai
            </Button>
            <Button
              size="sm"
              variant={
                privacy === GroupPrivacy.PRIVATE ? 'default' : 'secondary'
              }
              onClick={() => patch({ privacy: GroupPrivacy.PRIVATE })}
            >
              Riêng tư
            </Button>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen title="Sắp xếp theo">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between px-2">
              Sắp xếp theo
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 px-2 flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={!sortBy ? 'default' : 'secondary'}
              onClick={() => patch({ sortBy: undefined })}
            >
              Mặc định
            </Button>
            <Button
              size="sm"
              variant={sortBy === 'members' ? 'default' : 'secondary'}
              onClick={() => patch({ sortBy: 'members' })}
            >
              Số thành viên
            </Button>
            <Button
              size="sm"
              variant={sortBy === 'createdAt' ? 'default' : 'secondary'}
              onClick={() => patch({ sortBy: 'createdAt' })}
            >
              Mới tạo
            </Button>
          </CollapsibleContent>
        </Collapsible>

        <div className="px-2">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => patch({ privacy: undefined, sortBy: undefined })}
          >
            Đặt lại
          </Button>
        </div>
      </div>
    );
  }

  // users
  return (
    <div className="pl-2 pt-2 space-y-3 px-2">
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <div className="text-sm font-medium">Trạng thái</div>
          <div className="text-xs text-muted-foreground">
            Chỉ lấy user đang active
          </div>
        </div>
        <Switch
          checked={isActive === 'true'}
          onCheckedChange={(checked) =>
            patch({ isActive: checked ? 'true' : undefined })
          }
        />
      </div>

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => patch({ isActive: undefined })}
      >
        Đặt lại
      </Button>
    </div>
  );
}
