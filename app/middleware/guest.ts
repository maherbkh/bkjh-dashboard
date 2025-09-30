// middleware/guest.ts
import { useUserStore } from '~/stores/user';

/**
 * Guest-only routes (e.g., /login, /register, /forgot).
 * - If not authenticated, allow.
 * - If a token exists, optionally hydrate (throttled).
 * - If authenticated, redirect away.
 * - On login page, watch for authentication completion and redirect.
 */
export default defineNuxtRouteMiddleware(async (to) => {
    const userStore = useUserStore();

    // 1) No token => definitely a guest
    if (!userStore.accessToken) return;

    // 2) Light hydration if we have token but no user (once per minute)
    if (!userStore.user) {
        const lastValidation = useCookie<string | null>('last_auth_validation', { maxAge: 60 * 5 });
        const now = Date.now();
        const last = lastValidation.value ? Number(lastValidation.value) : 0;
        const shouldValidate
            = !Number.isFinite(last) || (now - (last || 0)) > 60_000;

        if (shouldValidate) {
            try {
                const ok = await userStore.fetchAuthUser();
                if (ok) lastValidation.value = String(now);
            }
            catch {
                // If hydration fails, clear broken tokens and remain on guest page
                userStore.setAccessToken();
                userStore.setUser();
                lastValidation.value = String(now);
                return;
            }
        }
    }

    // 3) If authenticated (token + user), bounce away
    if (userStore.accessToken && userStore.user) {
        const redirectTarget = (to.query?.redirect as string | undefined) || '/';
        return navigateTo(redirectTarget, { replace: true });
    }

    // 4) Watch for authentication changes during login process
    if (to.path === '/login' && userStore.accessToken && !userStore.user) {
        // Watch for user data to be populated (login completion)
        const stopWatcher = watch(
            () => userStore.user,
            (newUser) => {
                if (newUser && userStore.accessToken) {
                    stopWatcher(); // Stop watching
                    const redirectTarget = (to.query?.redirect as string | undefined) || '/';
                    navigateTo(redirectTarget, { replace: true });
                }
            },
            { immediate: false },
        );

        // Clean up watcher if component unmounts
        onBeforeUnmount(() => {
            stopWatcher();
        });
    }
});
