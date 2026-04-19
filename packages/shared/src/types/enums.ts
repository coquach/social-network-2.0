/**
 * Social Network Enums
 * Platform-agnostic enum definitions
 */

/**
 * Root content type for social actions
 */
export enum RootType {
  POST = 'POST',
  SHARE = 'SHARE',
}

/**
 * Target type for reactions and actions
 */
export enum TargetType {
  POST = 'POST',
  SHARE = 'SHARE',
  COMMENT = 'COMMENT',
}

/**
 * Post audience/privacy settings
 */
export enum Audience {
  PUBLIC = 'PUBLIC',
  FRIENDS = 'FRIENDS',
  ONLY_ME = 'ONLY_ME',
}

/**
 * Emotion/feeling types for posts
 */
export enum Emotion {
  JOY = 'JOY',
  SADNESS = 'SADNESS',
  ANGER = 'ANGER',
  FEAR = 'FEAR',
  DISGUST = 'DISGUST',
  SURPRISE = 'SURPRISE',
  NEUTRAL = 'NEUTRAL',
}

/**
 * Social event types for tracking
 */
export enum EventType {
  POST = 'POST',
  COMMENT = 'COMMENT',
  SHARE = 'SHARE',
  REACT = 'REACT',
}

/**
 * Reaction types (Facebook-style reactions)
 */
export enum ReactionType {
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  HAHA = 'HAHA',
  WOW = 'WOW',
  SAD = 'SAD',
  ANGRY = 'ANGRY',
}

/**
 * Media types for posts and comments
 */
export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  FILE = 'FILE',
}

/**
 * Post status in group moderation queue
 */
export enum PostGroupStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  PUBLISHED = 'PUBLISHED',
}

/**
 * Message status
 */
export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

/**
 * Notification status
 */
export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
}

// ==================== Group Enums ====================

/**
 * Group privacy settings
 */
export enum GroupPrivacy {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

/**
 * Group status
 */
export enum GroupStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
  DELETED = 'DELETED',
}

/**
 * Group member roles
 */
export enum GroupRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER',
}

/**
 * Group member status
 */
export enum GroupMemberStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
}

/**
 * Group permissions
 */
export enum GroupPermission {
  // Group
  MANAGE_GROUP = 'MANAGE_GROUP',
  MANAGE_MEMBERS = 'MANAGE_MEMBERS',
  UPDATE_GROUP = 'UPDATE_GROUP',

  // Posts
  APPROVE_POST = 'APPROVE_POST',
  DELETE_POST = 'DELETE_POST',

  // Members
  BAN_MEMBER = 'BAN_MEMBER',
  VIEW_REPORTS = 'VIEW_REPORTS',

  // Settings
  VIEW_SETTINGS = 'VIEW_SETTINGS',
  UPDATE_GROUP_SETTINGS = 'UPDATE_GROUP_SETTINGS',

  // Manage Join Requests
  MANAGE_JOIN_REQUESTS = 'MANAGE_JOIN_REQUESTS',

  // Events
  MANAGE_EVENTS = 'MANAGE_EVENTS',

  // Invitations
  INVITE_MEMBERS = 'INVITE_MEMBERS',
}

/**
 * Group invitation status
 */
export enum InviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED',
}

/**
 * Join request status
 */
export enum JoinRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

/**
 * Join request sort by options
 */
export enum JoinRequestSortBy {
  CREATED_AT = 'createdAt',
}

/**
 * Group event log types
 */
export enum GroupEventLog {
  // GROUP
  GROUP_UPDATED = 'GROUP_UPDATED',

  // SETTING
  GROUP_SETTING_CHANGED = 'GROUP_SETTING_CHANGED',

  // REQUEST
  JOIN_REQUEST_APPROVED = 'JOIN_REQUEST_APPROVED',
  JOIN_REQUEST_REJECTED = 'JOIN_REQUEST_REJECTED',

  // MEMBER
  MEMBER_JOINED = 'MEMBER_JOINED',
  MEMBER_LEFT = 'MEMBER_LEFT',
  MEMBER_REMOVED = 'MEMBER_REMOVED',
  MEMBER_BANNED = 'MEMBER_BANNED',
  MEMBER_UNBANNED = 'MEMBER_UNBANNED',

  // POST
  POST_APPROVED = 'POST_APPROVED',
  POST_REJECTED = 'POST_REJECTED',

  // ROLE & PERMISSION
  MEMBER_ROLE_CHANGED = 'MEMBER_ROLE_CHANGED',
  MEMBER_PERMISSION_CHANGED = 'MEMBER_PERMISSION_CHANGED',
}

/**
 * User's membership status with a group
 */
export enum MembershipStatus {
  NONE = 'NONE',
  MEMBER = 'MEMBER',
  INVITED = 'INVITED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  BANNED = 'BANNED',
}

/**
 * Report status for content moderation
 */
export enum ReportStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

/**
 * User relationship status
 */
export enum RelationStatus {
  NONE = 'NONE',
  FRIEND = 'FRIEND',
  PENDING = 'PENDING',
  BLOCKED = 'BLOCKED',
}
