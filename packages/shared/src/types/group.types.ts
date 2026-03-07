/**
 * Group-related type definitions
 * Platform-agnostic types for group operations
 */

import type {
  GroupPrivacy,
  GroupStatus,
  GroupRole,
  GroupMemberStatus,
  GroupPermission,
  InviteStatus,
  JoinRequestStatus,
  JoinRequestSortBy,
  GroupEventLog,
  MembershipStatus,
  MediaType,
  ReportStatus,
} from './enums';

// ==================== Group Core Types ====================

/**
 * Embedded group setting (minimal info)
 */
export interface GroupSettingEmbeddedDTO {
  requiredPostApproval: boolean;
  maxMembers: number;
  allowMemberInvite: boolean;
}

/**
 * Complete group data transfer object
 */
export interface GroupDTO {
  id: string;
  name: string;
  description?: string;
  avatarUrl: string;
  coverImageUrl?: string;
  privacy: GroupPrivacy;
  rules?: string;
  members: number;
  status: GroupStatus;
  createdAt: Date;
  userRole?: GroupRole;
  membershipStatus?: MembershipStatus;
  groupSetting?: GroupSettingEmbeddedDTO;
}

/**
 * Minimal group summary for lists
 */
export interface GroupSummaryDTO {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  privacy: GroupPrivacy;
  members: number;
  createdAt: Date;
}

/**
 * Invited group (includes inviter info)
 */
export interface InvitedGroupDTO extends GroupDTO {
  inviterNames: string[];
}

// ==================== Group Member ====================

/**
 * Group member data
 */
export interface GroupMemberDTO {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  groupId: string;
  status: GroupMemberStatus;
  role: GroupRole;
  customPermissions: GroupPermission[];
}

// ==================== Group Settings ====================

/**
 * Complete group settings
 */
export interface GroupSettingDTO {
  id: string;
  groupId: string;
  requiredPostApproval: boolean;
  allowMemberInvite: boolean;
  maxMembers: number;
  requireAdminApprovalToJoin: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

/**
 * Update group settings input
 */
export interface UpdateGroupSettingInput {
  requiredPostApproval?: boolean;
  maxMembers?: number;
  requireAdminApprovalToJoin?: boolean;
  allowMemberInvite?: boolean;
}

// ==================== Group Log ====================

/**
 * Activity log entry for group
 */
export interface GroupLogDTO {
  id: string;
  groupId: string;
  userId: string;
  eventType: string;
  content: string;
  createdAt: Date;
}

// ==================== Join Requests ====================

/**
 * Join request response
 */
export interface JoinRequestResponseDTO {
  id: string;
  groupId: string;
  inviterId: string;
  inviteeId: string;
  status: InviteStatus;
}

// ==================== Group Report ====================

/**
 * Group report data
 */
export interface GroupReportDTO {
  id: string;
  groupId: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: ReportStatus;
  createdAt: Date;
}

/**
 * Create group report input
 */
export interface CreateGroupReportInput {
  reason: string;
}

// ==================== Input Types ====================

/**
 * Media object for group images
 */
export interface MediaInput {
  type: MediaType;
  url: string;
  publicId?: string;
}

/**
 * Create new group input
 */
export interface CreateGroupInput {
  name: string;
  description?: string;
  avatar?: MediaInput;
  coverImage?: MediaInput;
  privacy: GroupPrivacy;
  rules?: string;
  groupCategoryId?: string;
}

/**
 * Update group input
 */
export interface UpdateGroupInput {
  name?: string;
  description?: string;
  avatar?: MediaInput;
  coverImage?: MediaInput;
  privacy?: GroupPrivacy;
  rules?: string;
  groupCategoryId?: string;
}

// ==================== Filter Types ====================

/**
 * Filter for group members list
 */
export interface GroupMemberFilter {
  cursor?: string;
  limit?: number;
  role?: GroupRole;
  status?: GroupMemberStatus;
}

/**
 * Filter for group logs
 */
export interface GroupLogFilter {
  cursor?: string;
  limit?: number;
  eventType?: GroupEventLog;
  startTime?: Date;
  endTime?: Date;
}

/**
 * Filter for join requests
 */
export interface JoinRequestFilter {
  cursor?: string;
  limit?: number;
  sortBy?: JoinRequestSortBy;
  status?: JoinRequestStatus;
}
