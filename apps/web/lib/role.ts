// Ordered from highest privilege to lowest privilege
export const ROLES = ['admin', 'moderator', 'staff', 'user'] as const;
export type Role = (typeof ROLES)[number];

// role ưu tiên cao đứng trước
const ROLE_PRIORITY: readonly Role[] = ROLES;

export function getRoleFromClaims(
  sessionClaims: unknown,
  fallback: Role = 'user'
): Role {
  if (!sessionClaims || typeof sessionClaims !== 'object') return fallback;

  const claims = sessionClaims as { publicMetadata?: unknown; role?: unknown };

  const pm =
    claims.publicMetadata && typeof claims.publicMetadata === 'object'
      ? (claims.publicMetadata as Record<string, unknown>)
      : {};

  const raw = pm.roles ?? pm.role ?? claims.role;

  // roles: string[]
  if (Array.isArray(raw)) {
    for (const role of ROLE_PRIORITY) {
      if (raw.includes(role)) return role;
    }
    return fallback;
  }

  // role: string
  if (typeof raw === 'string' && ROLES.includes(raw as Role)) {
    return raw as Role;
  }

  return fallback;
}

export function roleAtLeast(role: Role, minimum: Role): boolean {
  const roleIdx = ROLES.indexOf(role);
  const minIdx = ROLES.indexOf(minimum);
  if (roleIdx === -1 || minIdx === -1) return false;

  // ROLES is ordered high -> low, so smaller index means higher privilege
  return roleIdx <= minIdx;
}
