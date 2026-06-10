'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { GroupDTO } from '@repo/shared';
import clsx from 'clsx';
import { Globe, Lock, Users, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface GroupCardProps {
  group: GroupDTO;
  className?: string;
}

export const GroupCardSummary = ({
  group,
  className,
}: GroupCardProps) => {
  const PrivacyIcon =
    group.privacy === 'PUBLIC'
      ? Globe
      : group.privacy === 'PRIVATE'
      ? Users
      : Lock;

   

  return (
    <Link
      href={`/groups/${group.id}`}
      className={clsx(
        'block w-full rounded-2xl overflow-hidden border bg-white hover:shadow-md transition-all duration-200',
        className
      )}
    >
      {/* COVER + AVATAR */}
      <div className="relative w-full h-36 bg-gray-200">
        <Image
          src={group.coverImageUrl || '/images/placeholder-bg.png'}
          alt={`${group.name} cover`}
          fill
          loading="lazy"
          className="object-cover"
        />
        <div className="absolute -bottom-5 left-4 h-16 w-16 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
          <Image
            src={group.avatarUrl || '/images/placeholder.png'}
            alt={`${group.name} avatar`}
            fill
            loading="lazy"
            className="object-cover"
          />
        </div>
      </div>

      {/* INFO BELOW */}
      <div className="p-4 pt-7">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
            {group.name}
          </h3>
          <PrivacyIcon size={15} className="text-gray-500 shrink-0" />
        </div>

      
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
            {group.description && group.description.trim().length > 0
              ? group.description
              : 'Chưa có mô tả nào.'}
          </p>
      

        {/* FOOTER INFO */}
        <div className="flex items-center justify-between gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users size={13} className="text-gray-400" />
            {group.members}
          </span>

          <span className="flex items-center gap-1">
            <Calendar size={13} className="text-gray-400" />
            {new Date(group.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </Link>
  );
};

GroupCardSummary.Skeleton = function GroupCardSummarySkeleton() {
  return (
    <div className="w-full rounded-xl overflow-hidden bg-white border">
      {/* IMAGE SKELETON */}
      <div className="relative">
        <Skeleton className="w-full h-36" />
        <Skeleton className="absolute -bottom-5 left-4 h-12 w-12 rounded-full" />
      </div>

      <div className="p-4 pt-7">
        <Skeleton className="h-4 w-40 mb-3" />

        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-5/6 mb-3" />

        <div className="flex gap-4">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
};

