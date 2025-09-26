import { useRequestHeaders, useFetch, useCookie } from 'nuxt/app';
import { toast } from 'vue-sonner';
import type { UseFetchOptions } from 'nuxt/app';
import { useUserStore } from '~/stores/user';
import { useGlobalErrorHandler } from '~/composables/useGlobalErrorHandler';

export function useApiFetch<T = unknown>(
    path: string,
    options: UseFetchOptions<T> = {},
) {
    const config = useRuntimeConfig();
    const { handleError } = useGlobalErrorHandler();
    // Helper function to get CSRF token for state-changing requests
    const getCSRFToken = async () => {
        const method = String(options.method || 'GET').toUpperCase();

        // Only fetch CSRF token for state-changing requests
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            try {
                // Use $fetch instead of useFetch to avoid caching issues
                const csrfData = await $fetch(`${config.public.apiUrl}/auth/csrf-token`, {
                    credentials: 'include',
                    headers: {
                        'accept': 'application/json',
                        'x-requested-with': 'XMLHttpRequest',
                        'referer': import.meta.client ? window.location.origin : 'https://dashboard.backhaus.de',
                        'origin': import.meta.client ? window.location.origin : 'https://dashboard.backhaus.de',
                    },
                });
                return (csrfData as any)?.data?.csrfToken;
            }
            catch (error) {
                console.warn('Failed to fetch CSRF token:', error);
                return null;
            }
        }
        return null;
    };

    // Use Record<string, string> instead of `HeadersObject` (nuxt uses Fetch-compatible headers)
    const headers: Record<string, string> = {
        'accept': 'application/json',
        'x-requested-with': 'XMLHttpRequest',
        'referer': import.meta.client ? window.location.origin : 'https://dashboard.backhaus.de',
        'origin': import.meta.client ? window.location.origin : 'https://dashboard.backhaus.de',
    };

    // Add a Content-Type header for requests with body
    const method = String(options.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'PATCH'].includes(method) && options.body) {
        headers['content-type'] = 'application/json';
    }

    // CSRF token will be added dynamically in onRequest

    // Get auth token and add to headers if available
    const accessToken = useCookie('BKJH_ACCESS_TOKEN');
    if (accessToken.value) {
        headers.Authorization = `Bearer ${accessToken.value}`;
    }

    // Append server-side headers
    if (import.meta.server) {
        Object.assign(headers, useRequestHeaders(['cookie']));
    }

    return useFetch('/backend' + path, {
        credentials: 'include',
        server: false,
        watch: false,
        // Disable browser caching; backend controls freshness
        cache: 'no-store',
        // Stable key includes HTTP method so mutations don't reuse GET cache
        ...options,
        headers: {
            ...headers,
            ...(options.headers as Record<string, string>),
        },
        onResponseError({ response, error }) {
            // Use global error handler for all error responses
            if (import.meta.client) {
                try {
                    handleError(error);
                }
                catch (err) {
                    console.error('Error in global error handler:', err);
                    // Fallback error handling - redirect to login on 401
                    if (response.status === 401) {
                        const userStore = useUserStore();
                        userStore.logout();
                    }
                }
            }
        },
        async onRequest({ request, options: requestOptions }) {
            // Get CSRF token for state-changing requests
            const csrfToken = await getCSRFToken();
            if (csrfToken && requestOptions.headers) {
                (requestOptions.headers as unknown as Record<string, string>)['X-CSRF-TOKEN'] = csrfToken;
            }
        },
    });
}
