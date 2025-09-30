import { useUserStore } from '~/stores/user';

export default defineNuxtRouteMiddleware(async (to) => {
    const userStore = useUserStore();
    await new Promise(resolve => setTimeout(resolve, 100));
    await userStore.fetchAuthUser();
    // 1) No access token or user -> go to log in
    if (!userStore.accessToken) {
        return navigateTo({
            path: '/login',
            query: { redirect: to.fullPath },
            replace: true,
        });
    }
});
