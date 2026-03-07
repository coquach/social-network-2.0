import { AvatarWithStatus } from '@/components/avatar';
import { cn } from '@/lib/utils';
import { GroupRole } from '@/models/group/enums/group-role.enum';
import { GroupMemberDTO } from '@/models/group/groupMemberDTO';

type MemberCardProps = {
  member: GroupMemberDTO;
};

export const MemberCard = ({ member }: MemberCardProps) => {
  let roleTag: string | null = null;
  switch (member.role) {
    case GroupRole.OWNER:
      roleTag = 'Chủ nhóm';
      break;
    case GroupRole.ADMIN:
      roleTag = 'Quản trị viên';
      break;
    case GroupRole.MODERATOR:
      roleTag = 'Người kiểm duyệt';
      break;
    default:
      roleTag = null;
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-sky-100 bg-white/95 p-3 shadow-sm hover:border-sky-300 hover:bg-sky-50 transition-colors cursor-pointer">
      {/* Avatar + tên + status online/offline dùng component của bạn */}
      <AvatarWithStatus userId={member.userId} size="large" hasBorder />

      {/* Tag role / quyền ở bên phải */}
      {roleTag && (
        <span
          className={cn(
            'whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold border',
            member.role === GroupRole.OWNER &&
              'bg-amber-50 text-amber-800 border-amber-200',
            member.role === GroupRole.ADMIN &&
              'bg-sky-100 text-sky-800 border-sky-300',
            member.role === GroupRole.MODERATOR &&
              'bg-indigo-50 text-indigo-800 border-indigo-200'
          )}
        >
          {roleTag}
        </span>
      )}
    </div>
  );
};
