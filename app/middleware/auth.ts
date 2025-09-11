// middleware/auth.ts
import { useUserStore } from '~/stores/user'

/**
 * Protects routes that require authentication.
 * - Requires accessToken
 * - Verifies via fetchAuthUser() (throttled by last_auth_validation)
 * - On failure, clears state and redirects to /login?redirect=...
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const userStore = useUserStore()

  // 1) No access token -> go to login
  if (!userStore.accessToken) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
      replace: true,
    })
  }

  // 2) Throttle server validation to 1 minute using the same cookie key you already use
  const lastValidation = useCookie<string | null>('last_auth_validation', { maxAge: 60 * 5 })
  const now = Date.now()
  const last = lastValidation.value ? Number(lastValidation.value) : 0
  const shouldValidate =
    !Number.isFinite(last) || (now - (last || 0)) > 60_000 // 1 minute

  // 3) If no user yet (fresh tab/SSR) OR stale check -> verify session
  if (!userStore.user || shouldValidate) {
    try {
      const ok = await userStore.fetchAuthUser()
      if (!ok) throw new Error('auth check failed')
      lastValidation.value = String(now)
    } catch {
      // Hard reset to avoid half-authenticated state
      userStore.setAccessToken()
      userStore.setRefreshToken()
      userStore.setUser()
      // Prevent tight retry loop
      lastValidation.value = String(now)

      return navigateTo({
        path: '/login',
        query: { redirect: to.fullPath },
        replace: true,
      })
    }
  }

  // 4) Auth OK -> allow navigation
})
