import { useRequestHeaders, useFetch, useCookie } from 'nuxt/app';
import { toast } from 'vue-sonner';
import type { UseFetchOptions } from 'nuxt/app';

export function useApiFetch<T = unknown>(
    path: string,
    options: UseFetchOptions<T> = {},
) {
    // Helper function to ensure CSRF token exists for state-changing requests
    const ensureCSRFToken = async () => {
        const csrfToken = useCookie('XSRF-TOKEN');
        const method = String(options.method || 'GET').toUpperCase();
        
        // Only fetch CSRF token for state-changing requests and if token doesn't exist
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !csrfToken.value) {
            try {
                await useFetch('/backend/sanctum/csrf-cookie', {
                    credentials: 'include',
                });
            } catch (error) {
                console.warn('Failed to fetch CSRF cookie:', error);
            }
        }
    };

    // Use Record<string, string> instead of `HeadersObject` (nuxt uses Fetch-compatible headers)
    const headers: Record<string, string> = {
        accept: 'application/json',
        referer: import.meta.client ? window.location.origin : 'https://dashboard.backhaus.de',
    };    

    // Get CSRF token and add to headers if available
    const csrfToken = useCookie('XSRF-TOKEN');
    if (csrfToken.value) {
        headers['X-XSRF-TOKEN'] = csrfToken.value as string;
    }

    // Get auth token and add to headers if available
    const token = useCookie('BKJH_AUTH_TOKEN');
    if (token.value) {
        headers.Authorization = `Bearer ${token.value}`;
    }

    // Append server-side headers
    if (import.meta.server) {
        Object.assign(headers, useRequestHeaders(['cookie']));
    }
    
    return useFetch('/backend' + path, {
        credentials: 'include',
        watch: false,
        ...options,
        headers: {
            ...headers,
            ...(options.headers as Record<string, string>),
        },
        onResponseError({ response }) {
            console.error('API Error:', {
                status: response.status,
                url: path,
                headers: response.headers,
                data: response._data
            });
            
        },
        async onRequest({ request, options: requestOptions }) {
            // Ensure CSRF token exists for state-changing requests
            await ensureCSRFToken();
            
            // Update headers with fresh CSRF token if it was just fetched
            const freshCsrfToken = useCookie('XSRF-TOKEN');
            if (freshCsrfToken.value && requestOptions.headers) {
                (requestOptions.headers as unknown as Record<string, string>)['X-XSRF-TOKEN'] = freshCsrfToken.value as string;
            }
            
            if (import.meta.env.NODE_ENV === 'development') {
                console.log('API Request:', {
                    url: request,
                    headers: requestOptions.headers,
                    method: requestOptions.method || 'GET'
                });
            }
        },
    });
}
