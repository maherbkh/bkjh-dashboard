export default defineNuxtRouteMiddleware(async (to, from) => {
    const tenant = useCurrentTenant()

    // Only apply guest middleware logic for dashboard tenant
    if (tenant !== 'dashboard') {
        return
    }

    const userStore = useUserStore()

    // If we have a token but no user data, try to fetch user to verify authentication
    if (!userStore.user && userStore.token) {
        try {
            await userStore.fetchAuthUser()
        }
        catch (err) {
            // Token is invalid, clear it and allow access to guest pages
            userStore.setToken()
            userStore.setUser()
            return
        }
    }

    // If user is authenticated, redirect to dashboard
    if (userStore.user && userStore.token) {
        return navigateTo('/')
    }

    // User is not authenticated, allow access to guest pages
})
