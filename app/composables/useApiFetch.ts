// composables/useApiFetch.ts
import type { UseFetchOptions } from 'nuxt/app';
import { useFetch } from 'nuxt/app';
import { toRaw, watch } from 'vue';
import { useUserStore } from '~/stores/user';
import { useGlobalErrorHandler } from '~/composables/useGlobalErrorHandler';

/**
 * Backend contract: `x-app-lang` accepts `de` or `en`; unsupported values fall back to `de`.
 * We read the active Nuxt i18n locale and normalize it once for request headers.
 */

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
    appLang: 'de' | 'en';
};

function createDashboardFetchContext(): ApiFetchDeps {
    const { $i18n } = useNuxtApp();
    const rawLocale = typeof $i18n?.locale === 'string'
        ? $i18n.locale
        : String($i18n?.locale?.value ?? '');
    const normalizedLocale = rawLocale.trim().toLowerCase();
    return {
        handleError: useGlobalErrorHandler().handleError,
        userStore: useUserStore(),
        runtimeConfig: useRuntimeConfig(),
        appLang: normalizedLocale === 'en' ? 'en' : 'de',
    };
}

function buildMergedFetchOptions<T>(
    relativePath: string,
    opts: ApiFetchOptions<T>,
    deps: ApiFetchDeps,
) {
    const { handleError, userStore, runtimeConfig, appLang } = deps;
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
        'x-app-lang': appLang,
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

    const finalHeaders: Record<string, string> = {
        ...defaultHeaders,
        ...((opts.headers as Record<string, string> | undefined) ?? {}),
        'x-app-lang': appLang,
    };
    const originalOnResponse = opts.onResponse;

    function sanitizeBookingSuccessMessage(payload: unknown): void {
        if (!relativePath.includes('/booking/car-bookings')) return;
        if (!payload || typeof payload !== 'object') return;

        const maybeMessage = (payload as { message?: unknown }).message;
        if (typeof maybeMessage !== 'string') return;

        const cleaned = maybeMessage
            .replace(/\s*(?:,|-)?\s*(?:Buchungsreferenz|Booking reference)\s*:\s*[0-9a-fA-F-]{8,}\s*/gi, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();

        (payload as { message?: string }).message = cleaned;
    }

    const mergedForUseFetch: ApiFetchOptions<T> = {
        ...opts,
        method: method as ApiFetchOptions<T>['method'],
        headers: finalHeaders,
        credentials: 'include',
        onResponse(context) {
            sanitizeBookingSuccessMessage(context.response?._data);
            if (typeof originalOnResponse === 'function') {
                originalOnResponse(context);
            }
        },

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

/**
 * Standard headers for manual `fetch` to `/backend/...` when `useApiFetch`/`$fetch` is not used (e.g. blob downloads).
 * Must be called from a Nuxt/Vue setup context (`useI18n`, stores, runtime config available).
 */
export function buildDashboardApiFetchHeaders(overrides: Record<string, string> = {}): Record<string, string> {
    const deps = createDashboardFetchContext();
    const { userStore, runtimeConfig, appLang } = deps;

    const originUrl = runtimeConfig.public.appUrl
        || (import.meta.client ? window.location.origin : '');

    let token: string | undefined;
    if (typeof userStore.accessToken === 'string') {
        token = userStore.accessToken;
    }
    else {
        token = (userStore.accessToken as unknown as { value?: string })?.value;
    }

    const restOverrides = { ...overrides };
    delete restOverrides['x-app-lang'];
    const acceptOverride = restOverrides.accept ?? restOverrides.Accept;
    delete restOverrides.accept;
    delete restOverrides.Accept;

    const headers: Record<string, string> = {
        'accept': acceptOverride ?? 'application/json',
        'x-requested-with': 'XMLHttpRequest',
        'referer': originUrl,
        'origin': originUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...restOverrides,
        'x-app-lang': appLang,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}
