import type { AppSlug } from '~/types/app';

export const useAppStore = defineStore('app', () => {
    // App state stored in cookie
    const appSlug = useCookie<AppSlug>('BKJH_APP_SLUG', {
        default: () => 'support',
        maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    // Setters
    const setAppSlug = (slug: AppSlug) => {
        appSlug.value = slug;
    };

    return {
        // State
        appSlug: readonly(appSlug),

        // Actions
        setAppSlug,
    };
});
