import { useUserStore } from "~/stores/user"

export default defineNuxtRouteMiddleware(async (to, from) => {

    const userStore = useUserStore()

    // Always validate authentication if we have an access token
    // Add throttling to avoid too many requests (optional)
    const lastValidation = useCookie('last_auth_validation', { maxAge: 60 * 5 }) // 5 minutes
    const now = Date.now()
    const shouldValidate = !lastValidation.value || (now - parseInt(lastValidation.value)) > 60000 // 1 minute

    if (userStore.accessToken && shouldValidate) {
        try {
            const isAuthenticated = await userStore.fetchAuthUser()
            if (!isAuthenticated) {
                // Authentication failed, clear tokens and redirect to login
                userStore.setAccessToken()
                userStore.setRefreshToken()
                userStore.setUser()
                return navigateTo({
                    path: '/login',
                    query: { redirect: to.fullPath },
                })
            } else {
                // Update last validation timestamp
                lastValidation.value = now.toString()
            }
        }
        catch (err) {
            // Clear invalid tokens and redirect to login
            userStore.setAccessToken()
            userStore.setRefreshToken()
            userStore.setUser()
            return navigateTo({
                path: '/login',
                query: { redirect: to.fullPath },
            })
        }
    }

    // If still no user or access token, redirect to login
    if (!userStore.user || !userStore.accessToken) {
        return navigateTo({
            path: '/login',
            query: { redirect: to.fullPath },
        })
    }

    // User is authenticated, allow access
})
