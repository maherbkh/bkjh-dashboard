import { useUserStore } from '~/stores/user'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const tenant = useCurrentTenant()

    // Only apply guest middleware logic for dashboard tenant
    if (tenant !== 'dashboard') {
        return
    }

    const userStore = useUserStore()

    // If we have an access token but no user data, try to fetch user to verify authentication
    if (!userStore.user && userStore.accessToken) {
        try {
            const isAuthenticated = await userStore.fetchAuthUser()
            if (!isAuthenticated) {
                // Authentication failed, clear tokens and allow access to guest pages
                userStore.setAccessToken()
                userStore.setRefreshToken()
                userStore.setUser()
                return
            }
        }
        catch (err) {
            // Token is invalid, clear tokens and allow access to guest pages
            userStore.setAccessToken()
            userStore.setRefreshToken()
            userStore.setUser()
            return
        }
    }

    // If user is authenticated, redirect to dashboard
    if (userStore.user && userStore.accessToken) {
        // Use nextTick to ensure the current navigation completes first
        await nextTick()
        return navigateTo('/')
    }

    // User is not authenticated, allow access to guest pages
})
