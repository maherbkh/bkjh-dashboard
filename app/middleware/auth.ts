import { useUserStore } from '~/stores/user';

export default defineNuxtRouteMiddleware(async (to) => {
    console.log(`[AUTH MIDDLEWARE] ${new Date().toISOString()} - Running auth middleware for route: ${to.path}`);

    const userStore = useUserStore();
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log(`[AUTH MIDDLEWARE] ${new Date().toISOString()} - Calling fetchAuthUser`);
    await userStore.fetchAuthUser();

    // 1) No access token or user -> go to log in
    if (!userStore.accessToken) {
        console.log(`[AUTH MIDDLEWARE] ${new Date().toISOString()} - No access token, redirecting to login`);
        return navigateTo({
            path: '/login',
            query: { redirect: to.fullPath },
            replace: true,
        });
    }

    console.log(`[AUTH MIDDLEWARE] ${new Date().toISOString()} - Auth check passed for route: ${to.path}`);
});
