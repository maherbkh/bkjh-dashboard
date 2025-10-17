// composables/useApiFetch.ts
import type { UseFetchOptions } from 'nuxt/app';
import { useCookie, useFetch } from 'nuxt/app';
import { useUserStore } from '~/stores/user';
import { useGlobalErrorHandler } from '~/composables/useGlobalErrorHandler';

export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status?: number;
    errors?: Record<string, string[]>;
}

export interface ApiFetchOptions<T = any> extends UseFetchOptions<ApiResponse<T>> {
    skipAuth?: boolean;
}

/**
 * Custom wrapper around useFetch for your backend API.
 * Returns the same shape as useFetch: { data, error, refresh, status, etc. }
 */
export function useApiFetch<T = any>(
    path: string,
    opts: ApiFetchOptions<T> = {},
) {
    const { handleError } = useGlobalErrorHandler();
    const userStore = useUserStore();

    // Normalize method
    const method = (opts.method ?? 'GET').toString().toUpperCase();
    const skipAuth = opts.skipAuth ?? false;

    // Get runtime config for appUrl
    const runtimeConfig = useRuntimeConfig();
    const originUrl = runtimeConfig.public.appUrl || window.location.origin;

    // We'll build headers (static or reactive)
    const defaultHeaders: Record<string, string> = {
        'accept': 'application/json',
        'x-requested-with': 'XMLHttpRequest',
        'referer': originUrl,
        'origin': originUrl,
    };
    if (['POST', 'PUT', 'PATCH'].includes(method) && opts.body != null) {
        // Don't set Content-Type for FormData (let browser handle it with boundary)
        const isFormData = opts.body instanceof FormData;
        const isMediaAPI = path.includes('/shared/media/');

        if (!isFormData && !isMediaAPI) {
            defaultHeaders['Content-Type'] = 'application/json';
        }
    }

    if (!skipAuth) {
        // Handle both cases: when accessToken is a ref and when it's a string
        let token;
        if (typeof userStore.accessToken === 'string') {
            token = userStore.accessToken;
        }
        else {
            token = (userStore.accessToken as any)?.value;
        }

        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
    }

    // Compose the final fetch options including interceptors/hooks
    const finalHeaders = {
        ...defaultHeaders,
        ...(opts.headers as Record<string, string>),
    };


    const fetchOpts: ApiFetchOptions<T> = {
        ...opts,
        method: method as any,
        headers: finalHeaders,

        onResponseError({ response, options }) {
            try {
                handleError(response._data ?? response);
            }
            catch (err) {
                console.error('[API] handleError threw:', err);
                if (response.status === 401) {
                    userStore.logout();
                }
            }
        },
    };

    // Generate cache key that includes query parameters for GET requests
    const generateCacheKey = () => {
        if (opts.key) return opts.key;

        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            return `/backend${path}-${Date.now()}-${Math.random()}`;
        }

        // For GET requests, include query parameters in cache key to prevent caching issues
        const queryString = opts.query ? JSON.stringify(opts.query) : '';
        const queryHash = queryString ? `-${btoa(queryString).replace(/[^a-zA-Z0-9]/g, '')}` : '';
        return `/backend${path}${queryHash}`;
    };

    // Use server: false (CSR-only), no caching, dedupe cancel, immediate by default
    const fullPath = '/backend' + path;

    return useFetch<ApiResponse<T>>(fullPath, {
        server: false,
        cache: 'no-store',
        dedupe: 'cancel',
        immediate: opts.immediate ?? true,
        // Generate unique cache key that includes query parameters
        key: generateCacheKey(),
        ...fetchOpts,
    });
}
