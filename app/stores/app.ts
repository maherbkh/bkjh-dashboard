export const useApplicationStore = defineStore('application', () => {
    // Initialize the slug cookie with a default value if not set where the default value is "support" also values are "support"|"event"|"hr"
    const slug = useCookie<'support' | 'event' | 'hr'>('BKJH_APP_SLUG', { 
        default: () => 'support',
        maxAge: 60 * 60 * 24,
        sameSite: 'strict'
    })

    // Ensure the cookie has a valid value, fallback to 'support' if invalid
    if (!slug.value || !['support', 'event', 'hr'].includes(slug.value)) {
        slug.value = 'support'
    }
    const setApp = (data: 'support' | 'event' | 'hr') => (slug.value = data)

    return { setApp, slug }
})