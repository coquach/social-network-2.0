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
  createdAt: Date;
  relation?: {
    status: string;
  };
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
  friendCount?: number;
  postCount?: number;
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
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
}

export interface UpdateProfileInput extends UpdateUserInput {
  phoneNumber?: string;
}
