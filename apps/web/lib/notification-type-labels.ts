export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  friendship_request: 'Lời mời kết bạn',
  friendship_accept: 'Chấp nhận kết bạn',
  friend: 'Bạn bè',
  follow: 'Theo dõi',
  comment: 'Bình luận',
  reply_comment: 'Phản hồi bình luận',
  reaction: 'Cảm xúc',
  share: 'Chia sẻ',
  group_noti: 'Thông báo nhóm',
  group_invite: 'Lời mời tham gia nhóm',
  join_request_approved: 'Yêu cầu tham gia được chấp thuận',
};

export const getNotificationTypeLabel = (type: string) => {
  return NOTIFICATION_TYPE_LABELS[type] ?? type.replace(/_/g, ' ');
};
