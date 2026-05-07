export const APP_SLUGS = [
    'support',
    'academy',
    'dashboard',
    'booking',
    'hausmeister',
] as const;

export type AppSlug = typeof APP_SLUGS[number];
export type TenantSlug = AppSlug | 'shared';
