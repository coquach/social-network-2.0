import { AvatarImage } from './avatar-image';
import { AvatarName } from './avatar-name';
import { AvatarRoot } from './avatar-root';
import { AvatarStatus } from './avatar-status';

export const Avatar = Object.assign(AvatarRoot, {
  Root: AvatarRoot,
  Image: AvatarImage,
  Name: AvatarName,
  Status: AvatarStatus,
});

export { AvatarRoot, AvatarImage, AvatarName, AvatarStatus };
export type { AvatarContextValue, AvatarSize } from './avatar-context';
export type { AvatarRootProps } from './avatar-root';
