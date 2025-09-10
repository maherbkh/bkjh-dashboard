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
            console.log('Auth middleware: Validating authentication for', to.fullPath)
            const isAuthenticated = await userStore.fetchAuthUser()
            if (!isAuthenticated) {
                console.log('Auth middleware: Authentication failed, redirecting to login')
                // Authentication failed, clear tokens and redirect to login
                userStore.setAccessToken()
                userStore.setRefreshToken()
                userStore.setUser()
                return navigateTo({
                    path: '/login',
                    query: { redirect: to.fullPath },
                })
            } else {
                console.log('Auth middleware: Authentication successful')
                // Auth validation timestamp is now managed by user store
            }
        }
        catch (err) {
            console.log('Auth middleware: Auth check error, redirecting to login:', err)
            // Clear invalid tokens and redirect to login
            userStore.setAccessToken()
            userStore.setRefreshToken()
            userStore.setUser()
            // Update validation timestamp to prevent infinite retries
            lastValidation.value = now.toString()
            return navigateTo({
                path: '/login',
                query: { redirect: to.fullPath },
            })
        }
    }

    // If still no user or access token, redirect to login
    if (!userStore.user || !userStore.accessToken) {
        console.log('Auth middleware: No user or token, redirecting to login')
        return navigateTo({
            path: '/login',
            query: { redirect: to.fullPath },
        })
    }
    
    console.log('Auth middleware: User authenticated, allowing access to', to.fullPath)

    // User is authenticated, allow access
})
