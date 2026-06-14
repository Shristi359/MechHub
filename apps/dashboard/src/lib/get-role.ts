import { headers } from 'next/headers';

export type Role = 'admin' | 'dispatcher' | 'mechanic' | 'user';

/**
 * Server-side helper to read the current user's role from the
 * X-MechHub-Role header injected by Edge Middleware.
 * Only usable in Server Components and Route Handlers.
 */
export async function getRole(): Promise<Role> {
  const headersList = await headers();
  const role = headersList.get('x-mechhub-role');
  return (role as Role) ?? 'user';
}

export function can(role: Role, action: 'manage_all' | 'dispatch' | 'view_own'): boolean {
  const permissions: Record<Role, string[]> = {
    admin:      ['manage_all', 'dispatch', 'view_own'],
    dispatcher: ['dispatch', 'view_own'],
    mechanic:   ['view_own'],
    user:       [],
  };
  return permissions[role]?.includes(action) ?? false;
}
