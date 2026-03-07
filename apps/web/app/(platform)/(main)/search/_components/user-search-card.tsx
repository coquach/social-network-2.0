'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserDTO } from '@/models/user/userDTO';

export const UserSearchCard = ({ user }: { user: UserDTO }) => {
  return (
    <Link href={`/profile/${user.id}`} className="block">
      <Card className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-white via-white to-sky-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-linear-to-b from-sky-400 via-blue-500 to-indigo-500" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-sky-100 blur-2xl" />

        <div className="flex items-center gap-5 pl-4">
          <Avatar className="h-14 w-14 ring-2 ring-white shadow-md transition group-hover:ring-sky-200">
            <AvatarImage
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
            />
            <AvatarFallback>
              {`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="truncate text-lg font-semibold text-slate-900">
                {user.firstName} {user.lastName}
              </div>

              {user.relation?.status ? (
                <Badge
                  variant="outline"
                  className="h-6 border-slate-200 bg-white/80 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600"
                >
                  {user.relation.status}
                </Badge>
              ) : null}
            </div>

            <div className="truncate text-sm font-medium text-slate-600">
              {user.email}
            </div>

            {user.bio ? (
              <div className="mt-1 line-clamp-2 text-sm text-slate-500">
                {user.bio}
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  );
};

UserSearchCard.Skeleton = function UserSearchCardSkeleton() {
  return (
    <div className="h-[108px] w-full animate-pulse rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm" />
  );
};
