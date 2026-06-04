/**
 * User Types
 * Platform-agnostic user-related type definitions
 */

export enum PrivacyLevel {
  PUBLIC = 'PUBLIC',
  FRIENDS = 'FRIENDS',
  PRIVATE = 'PRIVATE',
}

export enum MessagePrivacy {
  EVERYONE = 'EVERYONE',
  FRIENDS = 'FRIENDS',
}

export interface UserPrivacySettings {
  profileVisibility: PrivacyLevel;
  messagePrivacy: MessagePrivacy;
  friendListVisibility: PrivacyLevel;
}

/**
 * User Types
 * Platform-agnostic user-related type definitions
 */

/**
 * Core user data transfer object
 */
export interface UserDTO {
  id: string;
  email: string;
  isActive: boolean;
  firstName: string;
  lastName: string;
  coverImageUrl?: string;
  coverImage?: {
    url?: string;
    publicId?: string;
  };
  avatarUrl: string;
  bio: string;
  location?: string;
  jobTitle?: string;
  company?: string;
  school?: string;
  interests?: string[];
  createdAt: Date;
  postCount: number;
  friendCount: number;
  relation?: {
    status: string;
  };
  privacySettings?: UserPrivacySettings;
}

/**
 * Minimal user info for display in posts/comments
 */
export interface UserSnapshotDTO {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

/**
 * User profile data
 */
export interface UserProfile extends UserDTO {
  followerCount?: number;
  followingCount?: number;
}

/**
 * Current authenticated user
 */
export interface CurrentUser extends UserDTO {
  emailVerified: boolean;
  phoneNumber?: string;
  lastLoginAt?: Date;
  preferences?: UserPreferences;
}

/**
 * User preferences/settings
 */
export interface UserPreferences {
  language?: string;
  timezone?: string;
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

/**
 * Input types for user operations
 */
export interface CreateUserInput {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  isActive?: boolean;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  jobTitle?: string;
  company?: string;
  school?: string;
  interests?: string[];
  avatarUrl?: string;
  coverImageUrl?: string;
  isActive?: boolean;
  privacySettings?: UserPrivacySettings;
}

export interface UpdateProfileInput extends UpdateUserInput {
  phoneNumber?: string;
}
