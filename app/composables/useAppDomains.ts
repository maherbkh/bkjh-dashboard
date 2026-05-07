import { AppDomain } from '~/types/settings';
import type { AppDomainType } from '~/types/settings-api';

/**
 * Ordered app domains for settings UIs (SHARED first). Values must stay in sync
 * with AppDomain in ~/types/settings — add new domains there and to this list.
 */
export const APP_DOMAINS_ORDERED: readonly AppDomainType[] = [
    AppDomain.SHARED,
    AppDomain.DASHBOARD,
    AppDomain.SUPPORT,
    AppDomain.ACADEMY,
    AppDomain.SIGNATURE,
    AppDomain.BOOKING,
    AppDomain.HAUSMEISTER,
];

export function useAppDomains() {
    function isValidAppDomain(value: string): value is AppDomainType {
        return APP_DOMAINS_ORDERED.includes(value as AppDomainType);
    }

    return {
        domains: APP_DOMAINS_ORDERED,
        defaultDomain: AppDomain.SHARED as AppDomainType,
        isValidAppDomain,
    };
}
