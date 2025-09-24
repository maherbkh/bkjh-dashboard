import { useUserStore } from '~/stores/user';
export default defineNuxtRouteMiddleware(async (to) => {
    const userStore = useUserStore();
    await userStore.fetchAuthUser();

    // 1) No access token or user -> go to login
    if (!userStore.accessToken || !userStore.user) {
        return navigateTo({
            path: '/login',
            query: { redirect: to.fullPath },
            replace: true,
        });
    }
});
