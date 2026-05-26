import { GroupMemberDTO, GroupRole } from '@repo/shared';
import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Avatar } from '~/components/avatar';
import { cn } from '~/lib/cn';


type MemberCardProps = {
    member: GroupMemberDTO;
    onPress?: () => void;
};

type RoleConfig = {
    label: string;
    className: string;
};

const ROLE_CONFIG: Partial<Record<GroupRole, RoleConfig>> = {
    [GroupRole.OWNER]: {
        label: 'Chủ nhóm',
        className: 'bg-amber-50 border-amber-200',
    },
    [GroupRole.ADMIN]: {
        label: 'Quản trị viên',
        className: 'bg-sky-100 border-sky-300',
    },
    [GroupRole.MODERATOR]: {
        label: 'Người kiểm duyệt',
        className: 'bg-indigo-50 border-indigo-200',
    },
};

const ROLE_TEXT_CLASS: Partial<Record<GroupRole, string>> = {
    [GroupRole.OWNER]: 'text-amber-800',
    [GroupRole.ADMIN]: 'text-sky-800',
    [GroupRole.MODERATOR]: 'text-indigo-800',
};

const MemberCardComponent = ({ member, onPress }: MemberCardProps) => {
    const roleConfig = ROLE_CONFIG[member.role];

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            className="flex-row items-center justify-between gap-3 rounded-lg border border-sky-100 bg-white/95 p-3 shadow-sm active:border-sky-300 active:bg-sky-50"
        >
            <Avatar
                userId={member.userId}
                size="large"
                hasBorder
                showName
                showStatus
                showOnlineStatus
                onBeforeNavigate={onPress}
            />

            {roleConfig && (
                <View
                    className={cn(
                        'rounded-full border px-2.5 py-0.5',
                        roleConfig.className,
                    )}
                >
                    <Text
                        className={cn(
                            'text-[11px] font-semibold',
                            ROLE_TEXT_CLASS[member.role],
                        )}
                    >
                        {roleConfig.label}
                    </Text>
                </View>
            )}
        </Pressable>
    );
};

export const MemberCard = memo(MemberCardComponent);