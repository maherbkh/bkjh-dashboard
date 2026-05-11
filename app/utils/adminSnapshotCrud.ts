import type { TenantSlug } from '~/types/app';

/** CRUD routes whose mutations invalidate the `/auth/admin-data` snapshot in the resources store. */
const ADMIN_SNAPSHOT_CRUD_KEYS: ReadonlyArray<readonly [TenantSlug, string]> = [
    ['support', 'ticket-categories'],
    ['academy', 'event-categories'],
    ['academy', 'event-targets'],
    ['shared', 'groups'],
    ['shared', 'addresses'],
    ['shared', 'occupations'],
    ['shared', 'companies'],
];

export function isAdminSnapshotCrud(tenant: TenantSlug, crudPath: string): boolean {
    return ADMIN_SNAPSHOT_CRUD_KEYS.some(([t, p]) => t === tenant && p === crudPath);
}
