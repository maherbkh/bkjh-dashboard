import { toast } from 'vue-sonner';
import { useUserStore } from '~/stores/user';

export const useGlobalErrorHandler = (t?: (key: string) => string) => {
    const userStore = useUserStore();

    const handleUnauthorized = () => {
        // Clear user data and token
        userStore.setToken();
        userStore.setUser();

        // Show toast notification
        toast.error(t ? t('auth.validation.incorrect_credentials') : 'Authentication Error', {
            description: t ? t('auth.token_refresh_failed') : 'Your session has expired. Please log in again.',
            duration: 5000,
        });

        // Redirect to login page with current path as redirect
        const route = useRoute();
        navigateTo({
            path: '/login',
            query: { redirect: route.fullPath },
        });
    };

    const handleForbidden = (error: any) => {
        const message = error?.data?.details?.message || error?.message || 'Access denied';
        
        toast.error(t ? t('global.messages.error') : 'Error', {
            description: message,
            duration: 5000,
        });
    };

    const handleValidationError = (error: any) => {
        const validationErrors = error?.data?.details?.validationErrors || [];
        
        if (validationErrors.length > 0) {
            // Show first validation error
            const firstError = validationErrors[0];
            toast.error(t ? t('global.messages.validation_error') : 'Validation Error', {
                description: `${firstError.field}: ${firstError.message}`,
                duration: 5000,
            });
        } else {
            // Fallback to generic validation message
            toast.error(t ? t('global.messages.validation_error') : 'Validation Error', {
                description: error?.data?.details?.message || error?.message || 'Validation failed',
                duration: 5000,
            });
        }
    };

    const handleCsrfError = (error: any) => {
        toast.error(t ? t('global.messages.error') : 'Error', {
            description: error?.message || 'CSRF token is invalid. Please refresh the page.',
            duration: 5000,
        });
    };

    const handleError = (error: any) => {
        if (!error || typeof error !== 'object') {
            console.error('Unhandled error:', error);
            return;
        }

        // Check for different error types
        const status = error.status || error.statusCode || error.response?.status;
        const errorCode = error?.data?.code || error?.error;

        // Handle 401 Unauthorized
        if (status === 401 || errorCode === 'UNAUTHORIZED') {
            handleUnauthorized();
            return;
        }

        // Handle 403 Forbidden
        if (status === 403 || errorCode === 'FORBIDDEN') {
            handleForbidden(error);
            return;
        }

        // Handle CSRF token errors
        if (errorCode === 'CSRF_TOKEN_INVALID') {
            handleCsrfError(error);
            return;
        }

        // Handle validation errors (400 with validation details)
        if (status === 400 && (errorCode === 'VALIDATION_ERROR' || error?.data?.details?.validationErrors)) {
            handleValidationError(error);
            return;
        }

        // For other errors, show generic error message
        const message = error?.data?.details?.message || error?.data?.message || error?.message || 'An unexpected error occurred';
        toast.error(t ? t('global.messages.error') : 'Error', {
            description: message,
            duration: 5000,
        });

        console.error('Unhandled error:', error);
    };

    return {
        handleUnauthorized,
        handleForbidden,
        handleValidationError,
        handleCsrfError,
        handleError,
    };
};
