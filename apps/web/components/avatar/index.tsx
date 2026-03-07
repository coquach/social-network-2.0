'use client';

import { AvatarRoot } from './avatar-root';
import { AvatarImage } from './avatar-image';
import { AvatarName } from './avatar-name';
import { AvatarStatus } from './avatar-status';

// Compound component exports
export const Avatar = Object.assign(AvatarRoot, {
  Root: AvatarRoot,
  Image: AvatarImage,
  Name: AvatarName,
  Status: AvatarStatus,
});

// Re-export individual components
export { AvatarRoot, AvatarImage, AvatarName, AvatarStatus };

// Export convenience variants
export * from './variants';
