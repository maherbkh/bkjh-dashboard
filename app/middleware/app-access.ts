import { useUserStore } from '~/stores/user'

export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore()
  
  // Only check app access if user is authenticated
  if (!userStore.user) {
    return
  }
  
  // Check app access for specific routes
  if (to.path.startsWith('/support') && !userStore.user.apps?.includes('support')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Support access required.'
    })
  }
  
  if (to.path.startsWith('/academy') && !userStore.user.apps?.includes('academy')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Academy access required.'
    })
  }
  
  if (to.path.startsWith('/dashboard') && !userStore.user.apps?.includes('dashboard')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Dashboard access required.'
    })
  }
})
