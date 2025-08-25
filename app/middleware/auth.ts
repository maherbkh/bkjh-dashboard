import { useUserStore } from "~/stores/user"

export default defineNuxtRouteMiddleware(async (to, from) => {

    const userStore = useUserStore()

    // If we have a token but no user data, try to fetch user
    if (!userStore.user && userStore.token) {
        try {
            await userStore.fetchAuthUser()
        }
        catch (err) {
            // Clear invalid token and redirect to login
            userStore.setToken()
            userStore.setUser()
            return navigateTo({
                path: '/login',
                query: { redirect: to.fullPath },
            })
        }
    }

    // If still no user or token, redirect to login
    if (!userStore.user || !userStore.token) {
        return navigateTo({
            path: '/login',
            query: { redirect: to.fullPath },
        })
    }

    // User is authenticated, allow access
})
