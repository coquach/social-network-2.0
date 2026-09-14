import { UserDTO as SystemUserDTO } from '@repo/shared';
import { UserDTO } from '@repo/shared';

type NameableUser = Pick<UserDTO, "firstName" | "lastName"> |
  Pick<SystemUserDTO, "firstName" | "lastName">;

export function getFullName(u: NameableUser) {
  return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
}

export function formatDateVN(d: Date | string) {
  return new Date(d).toLocaleDateString('vi-VN');
}
