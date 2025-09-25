import { toast } from 'vue-sonner';
import { useUserStore } from '~/stores/user';

export default defineNuxtPlugin(() => {
    const userStore = useUserStore();
    // Access i18n instance once at plugin init; don't call useI18n() later
    const { $i18n } = useNuxtApp();

    // Global error handler for 401 errors
    const handleUnauthorized = () => {
        // Clear user data and token
        userStore.setToken();
        userStore.setUser();

        // Show toast notification
        const translate = $i18n?.t?.bind($i18n) as ((key: string) => string) | undefined;
        toast.error(translate ? translate('auth.validation.incorrect_credentials') : 'Unauthorized', {
            description: translate ? translate('auth.token_refresh_failed') : 'Session expired. Please log in again.',
            duration: 5000,
        });

        // Redirect to login page with the current path as redirect
        const route = useRoute();
        navigateTo({
            path: '/login',
            query: { redirect: route.fullPath },
        });
    };

    // Listen for global fetch errors
    if (import.meta.client) {
        // Intercept fetch requests to catch 401 errors
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);

                // Check for 401 status
                if (response.status === 401) {
                    handleUnauthorized();
                    return response;
                }

                return response;
            }
            catch (error) {
                // Handle network errors or other fetch errors
                console.error('Fetch error:', error);
                throw error;
            }
        };

        // Also handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason?.status === 401 || event.reason?.statusCode === 401) {
                event.preventDefault();
                handleUnauthorized();
            }
        });
    }
});
