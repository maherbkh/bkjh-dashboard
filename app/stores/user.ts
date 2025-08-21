import { toast } from 'vue-sonner'
import type { LocationQueryValue } from '#vue-router'
import type { Credentials, LoginData, LoginResponse, ResetPasswordForm, User } from '~/types'

export const useUserStore = defineStore('user', () => {
    const { t } = useNuxtApp().$i18n

    const user = ref<User | undefined>()
    const token = useCookie('BKJH_AUTH_TOKEN', { maxAge: 60 * 60 * 24 })

    const setToken = (data?: string) => (token.value = data)
    const setUser = (data?: User) => (user.value = data)

    const logout = async () => {
        await useApiFetch('/api/auth/logout', { method: 'POST' })
        setToken()
        setUser()
        toast.success(t('auth.toasts.goodbye'), {
            description: t('auth.toasts.logout_success'),
            duration: 3000,
        })
        navigateTo('/login')
    }

    async function login(credentials: Credentials, path?: LocationQueryValue) {
        await useApiFetch('/sanctum/csrf-cookie')
        const { data, error } = await useApiFetch(`/api/auth/login`, {
            method: 'POST',
            body: credentials,
        })
        if (data.value) {
            setUser(((data.value as LoginResponse).data as LoginData).user)
            setToken(((data.value as LoginResponse).data as LoginData).token)
            const resourcesStore = useResourcesStore()
            resourcesStore.fetchPermissionsGroup()
            toast.success(t('auth.toasts.welcome'), {
                description: t('auth.toasts.login_success'),
                duration: 5000,
            })

            if (path) {
                navigateTo(path)
            }
            else {
                navigateTo('/')
            }
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
                    description = t('auth.validation.invalid_credentials')
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
        const { data: res, error } = await useApiFetch(`/api/auth/user`, {
            lazy: true,
            transform: res => (res as LoginResponse).data as User,
        })
        if (res.value) {
            setUser(res.value as User)
        }
        if (error && error.value) {
            setUser()
            await logout()
        }
    }

    const refresh = async () => {
        const { data, error } = await useApiFetch('/api/auth/refresh', {
            method: 'POST',
        })
        if (data.value) {
            setToken(((data.value as LoginResponse).data as LoginData).token)
            toast.success(t('auth.toasts.token_refreshed'), {
                description: t('auth.toasts.session_refreshed'),
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
        const { data, error } = await useApiFetch('/api/auth/forgot-password', {
            method: 'POST',
            body: { email },
        })
        if (data.value) {
            toast.success(t('auth.toasts.email_sent'), {
                description: t('auth.toasts.reset_link_sent'),
                duration: 5000,
            })
            return true
        }
        if (error.value) {
            const description = (error.value.data?.message ?? error.value.data?.status) || t('auth.failed_to_send_reset_email')
            toast.error(t('global.messages.error'), {
                description,
                duration: 5000,
            })
            return false
        }
        return false
    }

    const resetPassword = async (resetData: ResetPasswordForm) => {
        const { data, error } = await useApiFetch('/api/auth/reset-password', {
            method: 'POST',
            body: resetData,
        })
        if (data.value) {
            toast.success(t('auth.toasts.password_reset'), {
                description: t('auth.toasts.password_reset_success'),
                duration: 5000,
            })
            navigateTo('/login')
            return true
        }
        if (error.value) {
            const description = (error.value.data?.message ?? error.value.data?.status) || t('auth.password_reset_failed')
            toast.error(t('global.messages.error'), {
                description,
                duration: 5000,
            })
            return false
        }
        return false
    }

    return { user, token, setToken, setUser, fetchAuthUser, logout, login, refresh, forgotPassword, resetPassword }
})
