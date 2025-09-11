import { toast } from 'vue-sonner'
import type { LocationQueryValue } from '#vue-router'
import type { Credentials, LoginData, LoginResponse, ResetPasswordForm, User } from '~/types/index'
import {useResourcesStore} from "~/stores/resources";

export const useUserStore = defineStore('user', () => {
    const { t } = useNuxtApp().$i18n
    const user = ref<User | undefined>()
    const accessToken = useCookie('BKJH_ACCESS_TOKEN', { maxAge: 60 * 60 * 24 })
    const refreshToken = useCookie('BKJH_REFRESH_TOKEN', { maxAge: 60 * 60 * 24 * 7 }) // 7 days for refresh token
    const lastAuthValidation = useCookie('last_auth_validation', { maxAge: 60 * 5 }) // 5 minutes
    
    // Resources store instance - declared once for reuse
    const resourcesStore = useResourcesStore()

    const setAccessToken = (data?: string) => {
        accessToken.value = data
        return accessToken.value
    }
    const setRefreshToken = (data?: string) => (refreshToken.value = data)
    const setUser = (data?: User) => (user.value = data)
    const updateAuthValidation = () => (lastAuthValidation.value = Date.now().toString())
    const clearAuthValidation = () => (lastAuthValidation.value = null)
    
    // Legacy token getter for backward compatibility
    const token = computed(() => accessToken.value)
    
    // Legacy setToken function for backward compatibility
    const setToken = (data?: string) => setAccessToken(data)

    const logout = async () => {
        try {
            await useApiFetch('/api/v1/dashboard/auth/logout', { method: 'POST' })
        } catch (error) {
            // Continue with logout even if API call fails
        }
        
        setAccessToken()
        setRefreshToken()
        setUser()
        
        // Clear all resources data
        try {
            resourcesStore.clearAll()
        } catch (error) {
            // Failed to clear resources data
        }
        
        // Clear CSRF token cookie
        const csrfToken = useCookie('XSRF-TOKEN-DASHBOARD')
        csrfToken.value = null
        
        // Clear auth validation timestamp
        clearAuthValidation()
        toast.success(t('global.goodbye'), {
            description: t('auth.logout_success'),
            duration: 3000,
        })
        
        // Wait 200ms to ensure cookies are properly cleared
        await new Promise(resolve => setTimeout(resolve, 200))
        
        navigateTo('/login')
    }

    async function login(credentials: Credentials, path?: LocationQueryValue) {
        const { data, error } = await useApiFetch(`/api/v1/dashboard/auth/login`, {
            method: 'POST',
            body: credentials,
        })
        if (data.value) {
            const loginData = (data.value as any).data
            
            setUser(loginData.admin)
            setAccessToken(loginData.tokens.accessToken)
            setRefreshToken(loginData.tokens.refreshToken)
            
            // Fetch admin data after successful login
            try {
                // Wait a bit to ensure cookie is set
                await new Promise(resolve => setTimeout(resolve, 50))
                await resourcesStore.fetchAdminData()
            } catch (error) {
                // Don't block login if admin data fetch fails
            }
            
            toast.success(t('global.welcome'), {
                description: t('auth.login_success'),
                duration: 5000,
            })

            // Update auth validation timestamp
            updateAuthValidation()
            
            // Wait 200ms to ensure cookies are properly set
            await new Promise(resolve => setTimeout(resolve, 200))
            
            // Let middleware handle navigation - just ensure state is updated
            await nextTick()
            await navigateTo(path as string ? path : '/')
        }
        if (error.value) {
            // Handle different types of login errors
            const statusCode = error.value.statusCode || error.value.status
            let description = error.value.data?.message || error.value.message

            // Handle specific login error cases
            if (statusCode === 401 || statusCode === 422) {
                // Invalid credentials - check if a backend message is a translation key
                if (description && description.startsWith('auth.')) {
                    description = t(description)
                }
                else {
                    description = t('auth.invalid_credentials')
                }
            }
            else {
                // Other errors - check if a backend message is a translation key
                if (description && description.startsWith('auth.')) {
                    description = t(description)
                }
                else {
                    description = description || t('auth.login_failed')
                }
            }

            toast.error(t('global.messages.error'), {
                description,
                duration: 5000,
            })

            // Don't log out on login failure - the user is not authenticated yet
        }
    }
    const fetchAuthUser = async () => {
        // Use the auth check endpoint to verify authentication and get updated user data
        const { data: res, error } = await useApiFetch(`/api/v1/dashboard/auth/check`, {
            lazy: true,
        })
        if (res.value) {
            const responseData = (res.value as any).data
            // Update user data with fresh information from server
            setUser(responseData.admin)
            
            // Update access token if a new one is provided
            if (responseData.admin.currentToken) {
                setAccessToken(responseData.admin.currentToken)
            }
            
            // Fetch admin data after successful auth check
            try {
                await resourcesStore.fetchAdminData()
            } catch (error) {
                // Don't block auth check if admin data fetch fails
            }
            
            // Update auth validation timestamp on successful check
            updateAuthValidation()
            
            return true
        }
        if (error && error.value) {
            // Clear user data but don't call logout() to avoid unwanted redirects
            setUser()
            setAccessToken()
            setRefreshToken()
            return false
        }
        return false
    }

    const refresh = async () => {
        const { data, error } = await useApiFetch('/api/v1/dashboard/auth/refresh', {
            method: 'POST',
            body: {
                refreshToken: refreshToken.value
            }
        })
        if (data.value) {
            const refreshData = (data.value as any).data
            setAccessToken(refreshData.tokens.accessToken)
            setRefreshToken(refreshData.tokens.refreshToken)
            toast.success(t('auth.token_refreshed'), {
                description: t('auth.session_refreshed'),
                duration: 3000,
            })
        }
        if (error.value) {
            const description = (error.value.data?.message ?? error.value.data?.status) || t('auth.token_refresh_failed')
            toast.error(t('global.messages.error'), {
                description,
                duration: 5000,
            })
            await logout()
        }
    }

    const forgotPassword = async (email: string) => {
        const { data, error } = await useApiFetch('/api/v1/dashboard/auth/request-reset', {
            method: 'POST',
            body: { email },
        })
        if (data.value) {
            toast.success(t('auth.email_sent'), {
                description: t('auth.reset_link_sent'),
                duration: 5000,
            })
            return true
        }
        if (error.value) {
            const description = (error.value.data?.message ?? error.value.data?.status) || t('auth.failed_to_send_reset_email')
            toast.error(t('global.error'), {
                description,
                duration: 5000,
            })
            return false
        }
        return false
    }

    const resetPassword = async (resetData: ResetPasswordForm) => {
        const { data, error } = await useApiFetch('/api/v1/dashboard/auth/verify-reset', {
            method: 'POST',
            body: resetData,
        })
        if (data.value) {
            const resetResponse = (data.value as any).data
            // Reset password API returns admin and tokens in nested structure
            if (resetResponse.admin) {
                setUser(resetResponse.admin)
            }
            if (resetResponse.tokens) {
                setAccessToken(resetResponse.tokens.accessToken)
                setRefreshToken(resetResponse.tokens.refreshToken)
            }
            toast.success(t('auth.password_reset'), {
                description: t('auth.password_reset_success'),
                duration: 5000,
            })
            navigateTo('/')
            return true
        }
        if (error.value) {
            const description = (error.value.data?.message ?? error.value.data?.status) || t('auth.password_reset_failed')
            toast.error(t('global.error'), {
                description,
                duration: 5000,
            })
            return false
        }
        return false
    }

    // Get CSRF token for forms
    const getCsrfToken = async () => {
        try {
            const { data: csrfData } = await useApiFetch('/api/v1/dashboard/auth/csrf-token')
            return (csrfData.value as any)?.data?.csrfToken
        } catch (error) {
            return null
        }
    }

    // Get comprehensive admin data
    const getAdminData = async () => {
        try {
            const { data: adminData } = await useApiFetch('/api/v1/dashboard/auth/admin-data')
            return (adminData.value as any)?.data
        } catch (error) {
            throw error
        }
    }

    // Logout all sessions
    const logoutAll = async () => {
        try {
            await useApiFetch('/api/v1/dashboard/auth/logout-all', { method: 'POST' })
        } catch (error) {
            // Logout all API call failed
        }
        
        setAccessToken()
        setRefreshToken()
        setUser()
        
        // Clear auth validation timestamp
        clearAuthValidation()
        
        // Clear all resources data
        try {
            resourcesStore.clearAll()
        } catch (error) {
            // Failed to clear resources data
        }
        
        toast.success(t('global.goodbye'), {
            description: t('auth.logout_all_success'),
            duration: 3000,
        })
        
        // Wait 200ms to ensure cookies are properly cleared
        await new Promise(resolve => setTimeout(resolve, 200))
        
        navigateTo('/login')
    }

    // Change password
    const changePassword = async (currentPassword: string, newPassword: string) => {
        try {
            const { data, error } = await useApiFetch('/api/v1/dashboard/auth/change-password', {
                method: 'POST',
                body: { currentPassword, newPassword }
            })
            
            if (data.value) {
                toast.success(t('auth.password_changed'), {
                    description: t('auth.password_change_success'),
                    duration: 5000,
                })
                return true
            }
            
            if (error.value) {
                const description = error.value.data?.message || error.value.message || t('auth.password_change_failed')
                toast.error(t('global.error'), {
                    description,
                    duration: 5000,
                })
                return false
            }
        } catch (error) {
            toast.error(t('global.error'), {
                description: t('auth.password_change_failed'),
                duration: 5000,
            })
            return false
        }
        return false
    }

    // Update profile
    const updateProfile = async (profileData: any) => {
        try {
            const { data, error } = await useApiFetch('/api/v1/dashboard/auth/profile', {
                method: 'PUT',
                body: profileData
            })
            
            if (data.value) {
                const updatedUser = (data.value as any).data?.admin
                if (updatedUser) {
                    setUser(updatedUser)
                }
                toast.success(t('auth.profile_updated'), {
                    description: t('auth.profile_update_success'),
                    duration: 5000,
                })
                return true
            }
            
            if (error.value) {
                const description = error.value.data?.message || error.value.message || t('auth.profile_update_failed')
                toast.error(t('global.error'), {
                    description,
                    duration: 5000,
                })
                return false
            }
        } catch (error) {
            toast.error(t('global.error'), {
                description: t('auth.profile_update_failed'),
                duration: 5000,
            })
            return false
        }
        return false
    }

    return { 
        user, 
        token, 
        accessToken, 
        refreshToken,
        setToken, 
        setAccessToken,
        setRefreshToken,
        setUser, 
        fetchAuthUser, 
        logout, 
        login, 
        refresh, 
        forgotPassword, 
        resetPassword,
        getCsrfToken,
        getAdminData,
        logoutAll,
        changePassword,
        updateProfile
    }
})
