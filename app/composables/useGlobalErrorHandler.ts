import { toast } from 'vue-sonner';
import { useUserStore } from '~/stores/user';

export const useGlobalErrorHandler = () => {
    const userStore = useUserStore();
    const { t } = useI18n();

    const handleUnauthorized = () => {
        // Clear user data and token
        userStore.setToken();
        userStore.setUser();

        // Show toast notification
        toast.error(t('auth.validation.incorrect_credentials'), {
            description: t('auth.token_refresh_failed'),
            duration: 5000,
        });

        // Redirect to login page with current path as redirect
        const route = useRoute();
        navigateTo({
            path: '/login',
            query: { redirect: route.fullPath },
        });
    };

    const handleError = (error: any) => {
        // Check if it's a 401 error
        if (error && typeof error === 'object') {
            const status = error.status || error.statusCode || error.response?.status;

            if (status === 401) {
                handleUnauthorized();
                return;
            }
        }

        // For other errors, you can add additional handling here
        console.error('Unhandled error:', error);
    };

    return {
        handleUnauthorized,
        handleError,
    };
};
