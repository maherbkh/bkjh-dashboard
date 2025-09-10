import { useUserStore } from '~/stores/user'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const userStore = useUserStore()
  
  // Only run auth check if we have tokens but no admin data
  if (userStore.accessToken && !userStore.user) {
    try {
      const isAuthenticated = await userStore.fetchAuthUser()
      if (!isAuthenticated) {
        // Token is invalid, clear everything and redirect to login
        await userStore.logout()
        return navigateTo('/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      await userStore.logout()
      return navigateTo('/login')
    }
  }
})
