type AppSlugType = 'support' | 'academy' | 'dashboard'

export const useAppStore = defineStore('app', () => {
    // App state stored in cookie
    const appSlug = useCookie<AppSlugType>('BKJH_APP_SLUG', { 
        default: () => 'support',
        maxAge: 60 * 60 * 24 * 365 // 1 year
    })

    // Setters
    const setAppSlug = (slug: AppSlugType) => {
        appSlug.value = slug
    }

    // Getters
    const isSupport = computed(() => appSlug.value === 'support')
    const isAcademy = computed(() => appSlug.value === 'academy')
    const isDashboard = computed(() => appSlug.value === 'dashboard')

    return {
        // State
        appSlug: readonly(appSlug),
        
        // Getters
        isSupport,
        isAcademy,
        isDashboard,
        
        // Actions
        setAppSlug,
    }
})