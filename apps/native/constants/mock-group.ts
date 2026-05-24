import { GroupDTO, MembershipStatus, GroupPrivacy } from '@repo/shared/types';
import { GroupRole } from '@repo/shared/types'; // Giả sử enum nằm ở đây

export const MOCK_GROUP_DETAIL: GroupDTO = {
    id: 'group-1',
    name: 'Cộng đồng Backend UIT',
    description: 'Nơi chia sẻ kiến thức về Node.js, .NET và các hệ thống phân tán dành cho sinh viên UIT.',
    avatarUrl: 'https://cdn.tgdd.vn/Products/Images/42/281570/iphone-15-1-3-750x500.jpg',
    coverImageUrl: 'https://cdn.tgdd.vn/Products/Images/42/281570/iphone-15-1-3-750x500.jpg',
    privacy: GroupPrivacy.PUBLIC,
    members: 1250,
    status: 'ACTIVE' as any,
    createdAt: new Date(),
    userRole: GroupRole.ADMIN, // Mock quyền Admin để check các nút
    membershipStatus: MembershipStatus.MEMBER,
};

export const MOCK_POSTS = [
    {
        id: 'p1',
        author: 'Nguyễn Văn A',
        avatar: 'https://cdn.tgdd.vn/Products/Images/42/281570/iphone-15-1-3-750x500.jpg',
        content: 'Mọi người cho mình hỏi giữa NestJS và Express thì nên bắt đầu từ cái nào trước cho dự án SE-CV nhỉ?',
        time: '2 giờ trước',
        likes: 12,
        comments: 5
    },
    {
        id: 'p2',
        author: 'Trần Thị B',
        avatar: 'https://cdn.tgdd.vn/Products/Images/42/281570/iphone-15-1-3-750x500.jpg',
        content: 'Vừa hoàn thành xong module Authentication với JWT và Redis, xịn xò thực sự!',
        time: '5 giờ trước',
        likes: 45,
        comments: 10
    }
];