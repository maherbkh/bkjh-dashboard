import { useResourcesStore } from '~/stores/resources'

export default defineNuxtPlugin(async () => {
    const resourcesStore = useResourcesStore()

    // Only fetch if we're on the client side
    if (import.meta.client) {
        try {
            // Fetch public data on app initialization
            // This will use cache if data is fresh (not stale)
            await resourcesStore.fetchPublicData()
        } catch (error) {
            // Silently fail on initialization - data will be fetched when needed
            console.warn('Failed to initialize resources data:', error)
        }
    }
})
