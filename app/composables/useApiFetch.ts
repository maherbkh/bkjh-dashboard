// composables/useApiFetch.ts
import type { UseFetchOptions } from 'nuxt/app';
import { useFetch } from 'nuxt/app';
import { toRaw, watch } from 'vue';
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

type ApiFetchDeps = {
    handleError: ReturnType<typeof useGlobalErrorHandler>['handleError'];
    userStore: ReturnType<typeof useUserStore>;
    runtimeConfig: ReturnType<typeof useRuntimeConfig>;
};

function createDashboardFetchContext(): ApiFetchDeps {
    return {
        handleError: useGlobalErrorHandler().handleError,
        userStore: useUserStore(),
        runtimeConfig: useRuntimeConfig(),
    };
}

function buildMergedFetchOptions<T>(
    relativePath: string,
    opts: ApiFetchOptions<T>,
    deps: ApiFetchDeps,
) {
    const { handleError, userStore, runtimeConfig } = deps;
    const method = (opts.method ?? 'GET').toString().toUpperCase();
    const skipAuth = opts.skipAuth ?? false;

    const originUrl = runtimeConfig.public.appUrl
        || (import.meta.client ? window.location.origin : '');

    const defaultHeaders: Record<string, string> = {
        'accept': 'application/json',
        'x-requested-with': 'XMLHttpRequest',
        'referer': originUrl,
        'origin': originUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
    };

    const isMediaAPI = relativePath.includes('/shared/media/');
    if (['POST', 'PUT', 'PATCH'].includes(method) && opts.body != null) {
        const isFormData = opts.body instanceof FormData;
        if (!isFormData && !isMediaAPI) {
            defaultHeaders['Content-Type'] = 'application/json';
        }
    }

    if (!skipAuth) {
        let token: string | undefined;
        if (typeof userStore.accessToken === 'string') {
            token = userStore.accessToken;
        }
        else {
            token = (userStore.accessToken as unknown as { value?: string })?.value;
        }

        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
    }

    const finalHeaders = {
        ...defaultHeaders,
        ...(opts.headers as Record<string, string>),
    };

    const mergedForUseFetch: ApiFetchOptions<T> = {
        ...opts,
        method: method as ApiFetchOptions<T>['method'],
        headers: finalHeaders,
        credentials: 'include',

        onResponseError({ response }) {
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

    return {
        fullPath: `/backend${relativePath}` as const,
        mergedForUseFetch,
    };
}

const ASYNC_DATA_KEYS_TO_OMIT = new Set([
    'server',
    'lazy',
    'immediate',
    'default',
    'transform',
    'pick',
    'watch',
    'getCachedData',
    'dedupe',
    'key',
    'deep',
    'timeout',
]);

export async function fetchDashboardApi<T>(
    relativePath: string,
    opts: ApiFetchOptions<T> = {},
): Promise<ApiResponse<T>> {
    const deps = createDashboardFetchContext();
    const { fullPath, mergedForUseFetch } = buildMergedFetchOptions(relativePath, opts, deps);

    const forFetch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(mergedForUseFetch)) {
        if (!ASYNC_DATA_KEYS_TO_OMIT.has(k)) {
            forFetch[k] = v;
        }
    }

    return $fetch<ApiResponse<T>>(fullPath, forFetch as Record<string, unknown>);
}

export function useApiFetch<T = any>(
    path: string,
    opts: ApiFetchOptions<T> = {},
) {
    const deps = createDashboardFetchContext();
    const { fullPath, mergedForUseFetch } = buildMergedFetchOptions(path, opts, deps);

    const generateUniqueCacheKey = (): string => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);

        if (opts.key) {
            const baseKey = typeof opts.key === 'function' ? opts.key() : opts.key;
            return `${baseKey}-${timestamp}-${random}`;
        }

        const query = opts.query;
        let queryString = '';

        if (query) {
            try {
                const queryValue = toRaw(query);
                queryString = JSON.stringify(queryValue);
            }
            catch {
                queryString = JSON.stringify(query);
            }
        }

        const queryHash = queryString ? `-${btoa(queryString).replace(/[^a-zA-Z0-9]/g, '')}` : '';
        return `/backend${path}${queryHash}-${timestamp}-${random}`;
    };

    const fetchResult = useFetch<ApiResponse<T>>(fullPath, {
        server: false,
        cache: 'no-store',
        immediate: opts.immediate ?? true,
        key: generateUniqueCacheKey(),
        watch: opts.watch !== false && opts.query ? [opts.query] : opts.watch,
        getCachedData: () => undefined,
        ...mergedForUseFetch,
        dedupe: 'cancel',
    });

    if (opts.query && typeof opts.query === 'object') {
        watch(
            () => opts.query,
            () => {
                fetchResult.refresh();
            },
            { deep: true },
        );
    }

    return fetchResult;
}
