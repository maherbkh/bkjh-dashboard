// Vue composables are auto-imported in Nuxt

export interface PerformanceMetrics {
    renderTime: number;
    loadTime: number;
    memoryUsage: number;
    fps: number;
    errorCount: number;
}

export function useMediaPerformance() {
    const metrics = ref<PerformanceMetrics>({
        renderTime: 0,
        loadTime: 0,
        memoryUsage: 0,
        fps: 0,
        errorCount: 0,
    });

    const isMonitoring = ref(false);
    const frameCount = ref(0);
    const lastFrameTime = ref(0);
    const animationFrame = ref<number>();

    const startTime = ref(0);
    const endTime = ref(0);

    const startRenderTimer = () => {
        startTime.value = performance.now();
    };

    const endRenderTimer = () => {
        endTime.value = performance.now();
        metrics.value.renderTime = endTime.value - startTime.value;
    };

    const startLoadTimer = () => {
        startTime.value = performance.now();
    };

    const endLoadTimer = () => {
        endTime.value = performance.now();
        metrics.value.loadTime = endTime.value - startTime.value;
    };

    const measureMemoryUsage = () => {
        if ('memory' in performance) {
            const memory = (performance as any).memory;
            metrics.value.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
        }
    };

    const measureFPS = () => {
        const now = performance.now();
        frameCount.value++;

        if (lastFrameTime.value === 0) {
            lastFrameTime.value = now;
        }

        const deltaTime = now - lastFrameTime.value;
        if (deltaTime >= 1000) {
            metrics.value.fps = Math.round((frameCount.value * 1000) / deltaTime);
            frameCount.value = 0;
            lastFrameTime.value = now;
        }

        if (isMonitoring.value) {
            animationFrame.value = requestAnimationFrame(measureFPS);
        }
    };

    const startMonitoring = () => {
        isMonitoring.value = true;
        frameCount.value = 0;
        lastFrameTime.value = 0;
        measureFPS();
    };

    const stopMonitoring = () => {
        isMonitoring.value = false;
        if (animationFrame.value) {
            cancelAnimationFrame(animationFrame.value);
            animationFrame.value = undefined;
        }
    };

    const incrementErrorCount = () => {
        metrics.value.errorCount++;
    };

    const resetMetrics = () => {
        metrics.value = {
            renderTime: 0,
            loadTime: 0,
            memoryUsage: 0,
            fps: 0,
            errorCount: 0,
        };
    };

    const getPerformanceScore = computed(() => {
        const { renderTime, loadTime, fps, errorCount } = metrics.value;

        let score = 100;

        // Penalize slow render times
        if (renderTime > 16) score -= 20; // > 16ms is bad
        else if (renderTime > 8) score -= 10; // > 8ms is okay

        // Penalize slow load times
        if (loadTime > 1000) score -= 30; // > 1s is bad
        else if (loadTime > 500) score -= 15; // > 500ms is okay

        // Penalize low FPS
        if (fps < 30) score -= 25; // < 30 FPS is bad
        else if (fps < 60) score -= 10; // < 60 FPS is okay

        // Penalize errors
        if (errorCount > 0) score -= errorCount * 5;

        return Math.max(0, Math.min(100, score));
    });

    const getPerformanceLevel = computed(() => {
        const score = getPerformanceScore.value;

        if (score >= 90) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 50) return 'fair';
        return 'poor';
    });

    const getRecommendations = computed(() => {
        const recommendations: string[] = [];
        const { renderTime, loadTime, fps, errorCount } = metrics.value;

        if (renderTime > 16) {
            recommendations.push('Consider optimizing component rendering');
        }

        if (loadTime > 1000) {
            recommendations.push('Optimize image loading and compression');
        }

        if (fps < 60) {
            recommendations.push('Reduce animation complexity or use virtual scrolling');
        }

        if (errorCount > 0) {
            recommendations.push('Fix errors to improve performance');
        }

        if (metrics.value.memoryUsage > 100) {
            recommendations.push('Consider implementing image lazy loading');
        }

        return recommendations;
    });

    const logPerformance = () => {
        console.group('Media Performance Metrics');
        console.log('Render Time:', `${metrics.value.renderTime.toFixed(2)}ms`);
        console.log('Load Time:', `${metrics.value.loadTime.toFixed(2)}ms`);
        console.log('Memory Usage:', `${metrics.value.memoryUsage.toFixed(2)}MB`);
        console.log('FPS:', metrics.value.fps);
        console.log('Error Count:', metrics.value.errorCount);
        console.log('Performance Score:', getPerformanceScore.value);
        console.log('Performance Level:', getPerformanceLevel.value);
        console.log('Recommendations:', getRecommendations.value);
        console.groupEnd();
    };

    onMounted(() => {
        measureMemoryUsage();
    });

    onUnmounted(() => {
        stopMonitoring();
    });

    return {
        metrics: readonly(metrics),
        isMonitoring: readonly(isMonitoring),
        performanceScore: getPerformanceScore,
        performanceLevel: getPerformanceLevel,
        recommendations: getRecommendations,
        startRenderTimer,
        endRenderTimer,
        startLoadTimer,
        endLoadTimer,
        measureMemoryUsage,
        startMonitoring,
        stopMonitoring,
        incrementErrorCount,
        resetMetrics,
        logPerformance,
    };
}
