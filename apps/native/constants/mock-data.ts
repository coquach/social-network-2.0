import { GroupDTO, MembershipStatus, GroupPrivacy, GroupStatus, InvitedGroupDTO } from '@repo/shared/types';

// Chúng ta cast sang any hoặc định nghĩa type mở rộng để chứa inviterNames cho Tab Lời mời
export const MOCK_GROUPS: any[] = [
    {
        id: '1',
        name: 'Mệt Thì Nói',
        description: 'Không cần tích cực giả. Chỉ cần nói thật cảm xúc của mình.',
        avatarUrl: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=500',
        coverImageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
        privacy: GroupPrivacy.PUBLIC,
        members: 128,
        status: GroupStatus.ACTIVE,
        createdAt: new Date(),
        membershipStatus: MembershipStatus.MEMBER,
    },
    {
        id: '2',
        name: 'UIT - Cộng đồng Sinh viên',
        description: 'Nơi chia sẻ tài liệu và kinh nghiệm học tập tại UIT (HCMC University of Technology).',
        avatarUrl: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe1?w=500',
        coverImageUrl: 'https://images.unsplash.com/photo-1523050335456-c38459a0d317?w=800',
        privacy: GroupPrivacy.PUBLIC,
        members: 1250,
        status: GroupStatus.ACTIVE,
        createdAt: new Date(),
        membershipStatus: MembershipStatus.NONE,
    },
    {
        id: '3',
        name: 'Ký Túc Xá Khu B',
        description: 'Hội những người anh em thiện lành ở KTX Khu B - ĐHQG.',
        avatarUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500',
        coverImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        privacy: GroupPrivacy.PRIVATE,
        members: 890,
        status: GroupStatus.ACTIVE,
        createdAt: new Date(),
        membershipStatus: MembershipStatus.PENDING_APPROVAL,
    },
    // DỮ LIỆU MỚI CHO TAB LỜI MỜI (INVITED)
    {
        id: '4',
        name: 'Cộng đồng .NET Việt Nam',
        description: 'Chia sẻ kiến thức về ASP.NET Core, Entity Framework và kiến thức Backend.',
        avatarUrl: 'https://images.unsplash.com/photo-1517134191118-9d595e4c8c2b?w=500',
        privacy: GroupPrivacy.PUBLIC,
        members: 5600,
        status: GroupStatus.ACTIVE,
        createdAt: new Date(),
        membershipStatus: MembershipStatus.INVITED, // Trạng thái này sẽ giúp group hiện ở Tab 3
        inviterNames: ['Nguyên', 'Hoàng Duy'], // Danh sách người mời (dùng trong InvitedGroupCard)
    },
    {
        id: '5',
        name: 'Hội Designer UIT',
        description: 'Nơi giao lưu của các "pháp sư" Figma và UI/UX tại UIT.',
        avatarUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=500',
        privacy: GroupPrivacy.PRIVATE,
        members: 420,
        status: GroupStatus.ACTIVE,
        createdAt: new Date(),
        membershipStatus: MembershipStatus.INVITED,
        inviterNames: ['Minh Anh'],
    }
];

export const MOCK_ACTIVE_ROOMS = [
    {
        title: 'Weekly sync - Backend',
        members: '24 người đang tham gia',
        icon: 'videocam-outline' as const
    },
    {
        title: 'Góp ý project SE-CV',
        members: '31 bình luận mới',
        icon: 'chatbubbles-outline' as const
    },
];