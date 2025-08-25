import { toast } from 'vue-sonner'
import {useUserStore} from "~/stores/user";

export default defineNuxtPlugin(() => {
    const userStore = useUserStore()

    // Global error handler for 401 errors
    const handleUnauthorized = () => {
        // Clear user data and token
        userStore.setToken()
        userStore.setUser()
        
        // Show toast notification
        const { t } = useI18n()
        toast.error(t('auth.validation.incorrect_credentials'), {
            description: t('auth.token_refresh_failed'),
            duration: 5000,
        })
        
        // Redirect to login page with the current path as redirect
        const route = useRoute()
        navigateTo({
            path: '/login',
            query: { redirect: route.fullPath },
        })
    }

    // Listen for global fetch errors
    if (import.meta.client) {
        // Intercept fetch requests to catch 401 errors
        const originalFetch = window.fetch
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args)
                
                // Check for 401 status
                if (response.status === 401) {
                    handleUnauthorized()
                    return response
                }
                
                return response
            } catch (error) {
                // Handle network errors or other fetch errors
                console.error('Fetch error:', error)
                throw error
            }
        }

        // Also handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason?.status === 401 || event.reason?.statusCode === 401) {
                event.preventDefault()
                handleUnauthorized()
            }
        })
    }
}) 