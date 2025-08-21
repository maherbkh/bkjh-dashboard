import { useRequestHeaders, useFetch, useCookie } from 'nuxt/app';
import { toast } from 'vue-sonner';
import type { UseFetchOptions } from 'nuxt/app';

export function useApiFetch<T = unknown>(
    path: string,
    options: UseFetchOptions<T> = {},
) {

    // Use Record<string, string> instead of `HeadersObject` (nuxt uses Fetch-compatible headers)
    const headers: Record<string, string> = {
        accept: 'application/json',
        referer: import.meta.client ? window.location.origin : 'https://support.backhaus.de',
    };    

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
        onRequest({ request, options: requestOptions }) {
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
