// Nuxt 3 auto-imports types and composables
// ExtendedWindow type is available through auto-imports

/**
 * Client-side memory optimization plugin for Nuxt 3
 * Helps reduce memory usage and improve performance
 */
export default defineNuxtPlugin(() => {
    // Memory optimization utilities
    const memoryUtils = {
        // Clear unused references
        clearUnusedReferences: () => {
            // Force garbage collection if available
            if (typeof window !== 'undefined' && 'gc' in window) {
                (window as any).gc()
            }
        },

        // Monitor memory usage
        getMemoryUsage: () => {
            if (typeof performance !== 'undefined' && 'memory' in performance) {
                const memory = (performance as any).memory
                return {
                    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
                    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
                    limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
                }
            }
            return null
        },

        // Optimize images
        optimizeImages: () => {
            const images = document.querySelectorAll('img')
            images.forEach(img => {
                // Add loading="lazy" to images not in viewport
                if (!img.hasAttribute('loading')) {
                    img.loading = 'lazy'
                }
            })
        },

        // Debounce function to reduce memory usage
        debounce: <T extends (...args: any[]) => any>(
            func: T,
            wait: number
        ): ((...args: Parameters<T>) => void) => {
            let timeout: NodeJS.Timeout
            return (...args: Parameters<T>) => {
                clearTimeout(timeout)
                timeout = setTimeout(() => func(...args), wait)
            }
        },

        // Throttle function to reduce memory usage
        throttle: <T extends (...args: any[]) => any>(
            func: T,
            limit: number
        ): ((...args: Parameters<T>) => void) => {
            let inThrottle: boolean
            return (...args: Parameters<T>) => {
                if (!inThrottle) {
                    func(...args)
                    inThrottle = true
                    setTimeout(() => inThrottle = false, limit)
                }
            }
        }
    }

    // Add memory optimization to global scope
    if (typeof window !== 'undefined') {
        (window as any).$memoryUtils = memoryUtils
    }

    // Cleanup on page unload
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
            memoryUtils.clearUnusedReferences()
        })
    }

    return {
        provide: {
            memoryUtils
        }
    }
})
