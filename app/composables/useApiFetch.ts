// composables/useApiFetch.ts
import type { UseFetchOptions } from 'nuxt/app';
import { useCookie, useFetch } from 'nuxt/app';
import { computed, toRaw, watch } from 'vue';
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
        // Explicitly prevent caching
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
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
        credentials: 'include',

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

    // Generate ALWAYS unique cache key with timestamp to prevent ANY caching
    // Force unique key generation on every call - never reuse keys
    const generateUniqueCacheKey = (): string => {
        // Always include timestamp to ensure uniqueness and prevent caching
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);

        if (opts.key) {
            // Even if key is provided, append timestamp to make it unique
            const baseKey = typeof opts.key === 'function' ? opts.key() : opts.key;
            return `${baseKey}-${timestamp}-${random}`;
        }

        // Always generate completely unique key with timestamp and random
        // Include query params in the key so it changes when query changes
        const query = opts.query;
        let queryString = '';

        // Handle reactive query objects - get current value
        if (query) {
            try {
                // If query is reactive, toRaw will get the underlying value
                const queryValue = toRaw(query);
                queryString = JSON.stringify(queryValue);
            }
            catch {
                // Fallback to stringify
                queryString = JSON.stringify(query);
            }
        }

        const queryHash = queryString ? `-${btoa(queryString).replace(/[^a-zA-Z0-9]/g, '')}` : '';
        // ALWAYS include timestamp and random - ensures NO caching can occur
        // Timestamp ensures every request gets a unique key
        return `/backend${path}${queryHash}-${timestamp}-${random}`;
    };

    // Use server: false (CSR-only), ABSOLUTELY no caching, no deduplication
    const fullPath = '/backend' + path;

    // Override any cache-related options to ensure no caching
    const fetchResult = useFetch<ApiResponse<T>>(fullPath, {
        server: false, // Client-side only
        cache: 'no-store', // Explicitly disable HTTP caching
        dedupe: false, // Disable deduplication completely
        immediate: opts.immediate ?? true,
        // Generate unique key on every call - prevents any internal caching
        key: generateUniqueCacheKey(),
        // Watch query params and refresh when they change
        watch: opts.watch !== false && opts.query ? [opts.query] : opts.watch,
        // Disable any default caching behavior
        getCachedData: () => undefined, // Never return cached data
        ...fetchOpts,
    });

    // Watch query params and force refresh when they change
    if (opts.query && typeof opts.query === 'object') {
        watch(
            () => opts.query,
            () => {
                // Force refresh with new unique key when query changes
                fetchResult.refresh();
            },
            { deep: true },
        );
    }

    return fetchResult;
}
