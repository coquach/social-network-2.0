'use client';


import { GroupComposer } from '@/components/create-post/group-composer';
import { useGroupPermissionContext } from '@/contexts/group-permission-context';
import { MembershipStatus } from '@/models/group/groupDTO';

type GroupCreatePostProps = {
  groupId: string;
  placeholder: string;
};

export const GroupCreatePost = ({
  groupId,
  placeholder,
}: GroupCreatePostProps) => {
  const { group, role } = useGroupPermissionContext();
  const membershipStatus =
    group?.membershipStatus ??
    (role ? MembershipStatus.MEMBER : MembershipStatus.NONE);

  if (membershipStatus !== MembershipStatus.MEMBER) return null;

  return (
    <GroupComposer
      placeholder={placeholder}
      groupId={groupId}
    />
  );
};
