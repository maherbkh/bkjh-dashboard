// Nuxt 3 auto-imports Vue types and functions
// No need to manually import ref, onUnmounted, etc.

/**
 * Performance optimization composable for Nuxt 3
 */
export const usePerformance = () => {
    const memoryUsage = ref<{ used: number; total: number; limit: number } | null>(null);
    const performanceMetrics = ref<{
        loadTime: number;
        domContentLoaded: number;
        firstPaint: number;
        firstContentfulPaint: number;
    }>({
        loadTime: 0,
        domContentLoaded: 0,
        firstPaint: 0,
        firstContentfulPaint: 0,
    });

    // Monitor memory usage
    const updateMemoryUsage = () => {
        if (typeof performance !== 'undefined' && 'memory' in performance) {
            const memory = (performance as any).memory;
            memoryUsage.value = {
                used: Math.round(memory.usedJSHeapSize / 1048576), // MB
                total: Math.round(memory.totalJSHeapSize / 1048576), // MB
                limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
            };
        }
    };

    // Get performance metrics
    const getPerformanceMetrics = () => {
        if (typeof performance !== 'undefined') {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            const paint = performance.getEntriesByType('paint');

            performanceMetrics.value = {
                loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
                domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
                firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
            };
        }
    };

    // Start monitoring
    const startMonitoring = () => {
        // Update memory usage every 5 seconds
        const memoryInterval = setInterval(updateMemoryUsage, 5000);

        // Get performance metrics after page load
        if (document.readyState === 'complete') {
            getPerformanceMetrics();
        }
        else {
            window.addEventListener('load', getPerformanceMetrics);
        }

        // Cleanup function
        return () => {
            clearInterval(memoryInterval);
            window.removeEventListener('load', getPerformanceMetrics);
        };
    };

    // Memory warning threshold (80% of limit)
    const isMemoryWarning = computed(() => {
        if (!memoryUsage.value) return false;
        return (memoryUsage.value.used / memoryUsage.value.limit) > 0.8;
    });

    // Performance score (0-100)
    const performanceScore = computed(() => {
        const metrics = performanceMetrics.value;
        let score = 100;

        // Deduct points for slow loading
        if (metrics.loadTime > 3000) score -= 20;
        if (metrics.domContentLoaded > 2000) score -= 15;
        if (metrics.firstPaint > 1000) score -= 10;
        if (metrics.firstContentfulPaint > 1500) score -= 15;

        // Deduct points for high memory usage
        if (memoryUsage.value && isMemoryWarning.value) {
            score -= 20;
        }

        return Math.max(0, score);
    });

    return {
        memoryUsage: readonly(memoryUsage),
        performanceMetrics: readonly(performanceMetrics),
        isMemoryWarning,
        performanceScore,
        updateMemoryUsage,
        getPerformanceMetrics,
        startMonitoring,
    };
};
