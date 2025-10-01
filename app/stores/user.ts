import { toast } from 'vue-sonner';
import type { LocationQueryValue } from '#vue-router';
import type { Credentials, LoginData, LoginResponse, ResetPasswordForm, User } from '~/types/index';
import { useResourcesStore } from '~/stores/resources';
import { useAppStore } from '~/stores/app';

export const useUserStore = defineStore('user', () => {
    const { t } = useNuxtApp().$i18n;
    const user = ref<User | undefined>();
    const accessToken = useCookie('BKJH_ACCESS_TOKEN', { 
        maxAge: 60 * 15, // 15 minutes to match backend
        httpOnly: false,
        secure: false,
        sameSite: 'lax'
    });

    // Resources store instance - declared once for reuse
    const resourcesStore = useResourcesStore();
    const appStore = useAppStore();

    const setAccessToken = (data?: string) => {
        accessToken.value = data;
        return accessToken.value;
    };
    const setUser = (data?: User) => (user.value = data);

    // Legacy token getter for backward compatibility
    const token = computed(() => accessToken.value);

    // Legacy setToken function for backward compatibility
    const setToken = (data?: string) => setAccessToken(data);

    const logout = async () => {
        try {
            await useApiFetch('/auth/logout', { method: 'POST', lazy: true });
        }
        catch (error) {
            // Continue with logout even if API call fails
        }

        // Clear all user data
        setAccessToken(undefined);
        setUser(undefined);
        resourcesStore.clearAll();

        // Clear auth validation timestamp
        toast.success(t('global.goodbye'), {
            description: t('auth.logout_success'),
            duration: 5000,
        });

        navigateTo('/login');
    };

    async function login(credentials: Credentials, path?: LocationQueryValue) {
        const { data, error } = await useApiFetch(`/auth/login`, {
            method: 'POST',
            body: credentials,
        });

        if (data.value) {
            const loginData = (data.value as any).data;

            setUser(loginData.admin);
            setAccessToken(loginData.accessToken);

            // Smart app selection logic
            const userApps = loginData.admin.apps || [];
            const currentAppSlug = appStore.appSlug;
            
            // Check if current appSlug exists and is in user's apps
            if (currentAppSlug && userApps.includes(currentAppSlug)) {
                // Keep the current appSlug - user has access to it
                // No need to change it
            } else if (userApps.length > 0) {
                // Use first app from user's available apps
                const firstUserApp = userApps[0];
                appStore.setAppSlug(firstUserApp as 'support' | 'academy');
            } else {
                // Fallback to dashboard if user has no apps
                appStore.setAppSlug('dashboard');
            }

            // Wait for cookie to be set before fetching admin data
            await new Promise(resolve => setTimeout(resolve, 200));
            await resourcesStore.fetchAdminData();

            // Wait a bit to ensure cookie is set
            await new Promise(resolve => setTimeout(resolve, 300));

            toast.success(t('global.welcome'), {
                description: t('auth.login_success'),
                duration: 5000,
            });
           
            await navigateTo(path as string ? path : '/');
        }
        if (error.value) {
            console.error('❌ Login failed:', error.value);
            // Handle different types of login errors
            const statusCode = error.value.statusCode || error.value.status;
            let description = error.value.data?.message || error.value.message;

            // Handle specific login error cases
            if (statusCode === 401 || statusCode === 422) {
                // Invalid credentials - check if a backend message is a translation key
                if (description && description.startsWith('auth.')) {
                    description = t(description);
                }
                else {
                    description = t('auth.invalid_credentials');
                }
            }
            else {
                // Other errors - check if a backend message is a translation key
                if (description && description.startsWith('auth.')) {
                    description = t(description);
                }
                else {
                    description = description || t('auth.login_failed');
                }
            }
            toast.error(t('global.messages.error'), {
                description,
                duration: 5000,
            });
        }
    }
    const fetchAuthUser = async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); 
        // Use the auth check endpoint to verify authentication and get updated user data
        const { data: res, error } = await useApiFetch(`/auth/check`, {
            headers: {
                'Authorization': `Bearer ${accessToken.value}`,
                credentials: 'include',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            lazy: true,
            // Force fresh request to avoid cached responses
            key: `/auth/check-${Date.now()}-${Math.random()}`,
            server: false,
            cache: 'no-store'
        });
        if (res.value) {
            console.log('fetchAuthUser in Store res.value', res.value?.data);
            const responseData = (res.value as any).data;
            
            // Update user data with fresh information from the server
            setUser(responseData.admin);
            
            // Only update token if we don't have one
            // Don't update token from server response to avoid overwriting valid tokens
            if (!accessToken.value) {
                setAccessToken(responseData.admin.currentToken);
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            await resourcesStore.fetchAdminData();
        }
        if (error.value) {
            // Clear user data but don't call logout() to avoid unwanted redirects
            setUser(undefined);
            setAccessToken(undefined);
        }
    };

    const forgotPassword = async (email: string) => {
        const { data, error } = await useApiFetch('/auth/request-reset', {
            method: 'POST',
            body: { email },
        });
        if (data.value) {
            toast.success(t('auth.email_sent'), {
                description: t('auth.reset_link_sent'),
                duration: 5000,
            });
        }
        if (error.value) {
            const description = (error.value.data?.message ?? error.value.data?.status) || t('auth.failed_to_send_reset_email');
            toast.error(t('global.error'), {
                description,
                duration: 5000,
            });
        }
    };

    const resetPassword = async (resetData: ResetPasswordForm) => {
        const { data, error } = await useApiFetch('/auth/verify-reset', {
            method: 'POST',
            body: resetData,
        });
        if (data.value) {
            const resetResponse = (data.value as any).data;
            // Reset password API returns admin and accessToken directly
            if (resetResponse.admin) {
                setUser(resetResponse.admin);
            }
            if (resetResponse.accessToken) {
                setAccessToken(resetResponse.accessToken);
            }
            toast.success(t('auth.password_reset'), {
                description: t('auth.password_reset_success'),
                duration: 5000,
            });
            navigateTo('/');
        }
        if (error.value) {
            const description = (error.value.data?.message ?? error.value.data?.status) || t('auth.password_reset_failed');
            toast.error(t('global.error'), {
                description,
                duration: 5000,
            });
        }
    };

    // Logout all sessions
    const logoutAll = async () => {
        try {
            await useApiFetch('/auth/logout-all', { method: 'POST' });
        }
        catch (error) {
            // Logout all API call failed
        }

        setAccessToken(undefined);
        setUser(undefined);
        resourcesStore.clearAll();

        toast.success(t('global.goodbye'), {
            description: t('auth.logout_all_success'),
            duration: 5000,
        });

        navigateTo('/login');
    };

    // Change password
    const changePassword = async (currentPassword: string, newPassword: string) => {
        try {
            const { data, error } = await useApiFetch('/auth/change-password', {
                method: 'POST',
                body: { currentPassword, newPassword },
            });

            if (data.value) {
                toast.success(t('auth.password_changed'), {
                    description: t('auth.password_change_success'),
                    duration: 5000,
                });
            }

            if (error.value) {
                const description = error.value.data?.message || error.value.message || t('auth.password_change_failed');
                toast.error(t('global.error'), {
                    description,
                    duration: 5000,
                });
            }
        }
        catch (error) {
            toast.error(t('global.error'), {
                description: t('auth.password_change_failed'),
                duration: 5000,
            });
        }
    };

    // Update profile
    const updateProfile = async (profileData: any) => {
        try {
            const { data, error } = await useApiFetch('/auth/profile', {
                method: 'PUT',
                body: profileData,
            });

            if (data.value) {
                await fetchAuthUser();
            }

            if (error.value) {
                const description = error.value.data?.message || error.value.message || t('auth.profile_update_failed');
                toast.error(t('global.error'), {
                    description,
                    duration: 5000,
                });
            }
        }
        catch (error) {
            toast.error(t('global.error'), {
                description: t('auth.profile_update_failed'),
                duration: 5000,
            });
        }
    };

    return {
        user,
        token,
        accessToken,
        setToken,
        setAccessToken,
        setUser,
        fetchAuthUser,
        logout,
        login,
        forgotPassword,
        resetPassword,
        logoutAll,
        changePassword,
        updateProfile,
    };
});
