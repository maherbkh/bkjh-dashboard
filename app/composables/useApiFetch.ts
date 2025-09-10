import { useRequestHeaders, useFetch, useCookie } from 'nuxt/app';
import { toast } from 'vue-sonner';
import type { UseFetchOptions } from 'nuxt/app';

export function useApiFetch<T = unknown>(
    path: string,
    options: UseFetchOptions<T> = {},
) {
    const config = useRuntimeConfig()
    // Helper function to get CSRF token for state-changing requests
    const getCSRFToken = async () => {
        const method = String(options.method || 'GET').toUpperCase();
        
        // Only fetch CSRF token for state-changing requests
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            try {
                // Use $fetch instead of useFetch to avoid caching issues
                const csrfData = await $fetch(`${config.public.apiUrl}/api/v1/dashboard/auth/csrf-token`, {
                    credentials: 'include',
                    headers: {
                        'accept': 'application/json',
                        'x-requested-with': 'XMLHttpRequest',
                        'referer': process.client ? window.location.origin : 'http://dashboard.backhaus.test:3022',
                        'origin': process.client ? window.location.origin : 'http://dashboard.backhaus.test:3022',
                    }
                });
                return (csrfData as any)?.data?.csrfToken;
            } catch (error) {
                console.warn('Failed to fetch CSRF token:', error);
                return null;
            }
        }
        return null;
    };

    // Use Record<string, string> instead of `HeadersObject` (nuxt uses Fetch-compatible headers)
    const headers: Record<string, string> = {
        accept: 'application/json',
        'x-requested-with': 'XMLHttpRequest',
        referer: process.client ? window.location.origin : 'http://dashboard.backhaus.test:3022',
        origin: process.client ? window.location.origin : 'http://dashboard.backhaus.test:3022',
    };

    // Add Content-Type header for requests with body
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
    if (process.server) {
        Object.assign(headers, useRequestHeaders(['cookie']));
    }
    
    return useFetch(`${config.public.apiUrl}` + path, {
        credentials: 'include',
        watch: false,
        key: `${path}-${Date.now()}`, // Add cache busting key
        ...options,
        headers: {
            ...headers,
            ...(options.headers as Record<string, string>),
        },
        onResponseError({ response }) {
            // Handle 401 Unauthorized - attempt token refresh
            if (response.status === 401 && process.client) {
                const refreshToken = useCookie('BKJH_REFRESH_TOKEN');
                if (refreshToken.value) {
                    // Attempt to refresh token
                    useApiFetch('/api/v1/dashboard/auth/refresh', {
                        method: 'POST',
                        body: { refreshToken: refreshToken.value }
                    }).then(({ data: refreshData, error: refreshError }) => {
                        if (refreshData.value && !refreshError.value) {
                            const refreshResponse = refreshData.value as any;
                            if (refreshResponse.data && refreshResponse.data.tokens) {
                                const accessToken = useCookie('BKJH_ACCESS_TOKEN');
                                const newRefreshToken = useCookie('BKJH_REFRESH_TOKEN');
                                accessToken.value = refreshResponse.data.tokens.accessToken;
                                newRefreshToken.value = refreshResponse.data.tokens.refreshToken;
                                
                                // Show success notification
                                toast.success('Session refreshed', {
                                    description: 'Your session has been automatically renewed',
                                    duration: 3000,
                                });
                            }
                        } else {
                            // Refresh failed, redirect to login
                            toast.error('Session expired', {
                                description: 'Please login again',
                                duration: 4000,
                            });
                            navigateTo('/login');
                        }
                    }).catch(() => {
                        toast.error('Session expired', {
                            description: 'Please login again',
                            duration: 4000,
                        });
                        navigateTo('/login');
                    });
                } else {
                    // No refresh token, redirect to login
                    navigateTo('/login');
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
