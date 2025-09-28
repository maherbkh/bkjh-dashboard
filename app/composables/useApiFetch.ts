// composables/useApiFetch.ts
import { useFetch } from 'nuxt/app'
import type { UseFetchOptions } from 'nuxt/app'
import { useCookie } from 'nuxt/app'
import { useUserStore } from '~/stores/user'
import { useGlobalErrorHandler } from '~/composables/useGlobalErrorHandler'

export interface ApiResponse<T = any> {
  data: T
  message?: string
  status?: number
  errors?: Record<string, string[]>
}

export interface ApiFetchOptions<T = any> extends UseFetchOptions<ApiResponse<T>> {
  skipAuth?: boolean
  skipCSRF?: boolean
}

/**
 * Custom wrapper around useFetch for your backend API.
 * Returns the same shape as useFetch: { data, error, refresh, status, etc. }
 */
export function useApiFetch<T = any>(
  path: string,
  opts: ApiFetchOptions<T> = {}
) {
  const { handleError } = useGlobalErrorHandler()
  const userStore = useUserStore()

  // Normalize method
  const method = (opts.method ?? 'GET').toString().toUpperCase()
  const skipAuth = opts.skipAuth ?? false
  const skipCSRF = opts.skipCSRF ?? false

  // We'll build headers (static or reactive)
  const defaultHeaders: Record<string, string> = {
    accept: 'application/json',
    'x-requested-with': 'XMLHttpRequest',
    // In CSR mode, referer/origin is window.origin
    referer: window.location.origin,
    origin: window.location.origin,
  }
  if (['POST', 'PUT', 'PATCH'].includes(method) && opts.body != null) {
    defaultHeaders['Content-Type'] = 'application/json'
  }

  if (!skipAuth) {
    const token = useCookie('BKJH_ACCESS_TOKEN').value
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  // Compose the final fetch options including interceptors/hooks
  const fetchOpts: ApiFetchOptions<T> = {
    ...opts,
    method: method as any,
    headers: {
      ...defaultHeaders,
      ...(opts.headers as Record<string, string>),
    },

    // Use onRequest hook to inject CSRF token
    async onRequest({ request, options }) {
      if (!skipCSRF && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        try {
          const resp = await $fetch<{ data: { csrfToken: string } }>(
            '/backend/auth/csrf-token',
            {
              credentials: 'include',
              headers: {
                accept: 'application/json',
                'x-requested-with': 'XMLHttpRequest',
              },
            }
          )
          const csrf = resp?.data?.csrfToken
          if (csrf) {
            options.headers = options.headers || {}
            ;(options.headers as unknown as Record<string, string>)['X-Dashboard-CSRF-Token'] = csrf
          }
        } catch (err) {
          console.warn('[CSRF] fetch failed in onRequest:', err)
        }
      }
    },

    onResponseError({ response, options }) {
      try {
        handleError(response._data ?? response)
      } catch (err) {
        console.error('[API] handleError threw:', err)
        if (response.status === 401) {
          userStore.logout()
        }
      }
    },
  }

  // Use server: false (CSR-only), no caching, dedupe cancel, immediate by default
  const result = useFetch<ApiResponse<T>>('/backend' + path, {
    server: false,
    cache: 'no-store',
    dedupe: 'cancel',
    immediate: opts.immediate ?? true,
    ...fetchOpts,
  })

  return result
}
