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

  // Get runtime config for appUrl
  const runtimeConfig = useRuntimeConfig()
  const originUrl = runtimeConfig.public.appUrl || window.location.origin

  // We'll build headers (static or reactive)
  const defaultHeaders: Record<string, string> = {
    accept: 'application/json',
    'x-requested-with': 'XMLHttpRequest',
    referer: originUrl,
    origin: originUrl,
  }
  if (['POST', 'PUT', 'PATCH'].includes(method) && opts.body != null) {
    defaultHeaders['Content-Type'] = 'application/json'
  }

  if (!skipAuth) {
    const token = useCookie('BKJH_ACCESS_TOKEN').value
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`
    } else {
      console.warn(`[AUTH] ${new Date().toISOString()} - No token found for ${method} ${path}`)
    }
  }

  // Compose the final fetch options including interceptors/hooks
  const finalHeaders = {
    ...defaultHeaders,
    ...(opts.headers as Record<string, string>),
  }

  const fetchOpts: ApiFetchOptions<T> = {
    ...opts,
    method: method as any,
    headers: finalHeaders,


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
    // Force fresh requests for state-changing operations
    key: opts.key || (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) 
      ? `/backend${path}-${Date.now()}-${Math.random()}` 
      : `/backend${path}`),
    ...fetchOpts,
  })

  return result
}
