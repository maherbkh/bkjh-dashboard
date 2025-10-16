// Vue composables are auto-imported in Nuxt

export interface LazyLoadingOptions {
    rootMargin?: string;
    threshold?: number;
    delay?: number;
}

export function useMediaLazyLoading(
    options: LazyLoadingOptions = {},
) {
    const {
        rootMargin = '50px',
        threshold = 0.1,
        delay = 100,
    } = options;

    const observer = ref<IntersectionObserver | null>(null);
    const observedElements = ref<Set<Element>>(new Set());
    const loadedImages = ref<Set<string>>(new Set());
    const loadingImages = ref<Set<string>>(new Set());
    const failedImages = ref<Set<string>>(new Set());

    const isImageLoaded = (src: string): boolean => {
        return loadedImages.value.has(src);
    };

    const isImageLoading = (src: string): boolean => {
        return loadingImages.value.has(src);
    };

    const isImageFailed = (src: string): boolean => {
        return failedImages.value.has(src);
    };

    const loadImage = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (loadedImages.value.has(src)) {
                resolve();
                return;
            }

            if (loadingImages.value.has(src)) {
                return;
            }

            loadingImages.value.add(src);

            const img = new Image();

            img.onload = () => {
                loadedImages.value.add(src);
                loadingImages.value.delete(src);
                resolve();
            };

            img.onerror = () => {
                failedImages.value.add(src);
                loadingImages.value.delete(src);
                reject(new Error(`Failed to load image: ${src}`));
            };

            img.src = src;
        });
    };

    const observeElement = (element: Element, callback: () => void) => {
        if (!observer.value) {
            observer.value = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const target = entry.target;
                            if (observedElements.value.has(target)) {
                                callback();
                                observer.value?.unobserve(target);
                                observedElements.value.delete(target);
                            }
                        }
                    });
                },
                {
                    rootMargin,
                    threshold,
                },
            );
        }

        observedElements.value.add(element);
        observer.value.observe(element);
    };

    const unobserveElement = (element: Element) => {
        if (observer.value && observedElements.value.has(element)) {
            observer.value.unobserve(element);
            observedElements.value.delete(element);
        }
    };

    const preloadImage = (src: string): Promise<void> => {
        return loadImage(src);
    };

    const preloadImages = (srcs: string[]): Promise<void> => {
        return Promise.all(srcs.map(src => loadImage(src))).then(() => {});
    };

    const clearCache = () => {
        loadedImages.value.clear();
        loadingImages.value.clear();
        failedImages.value.clear();
    };

    const getImagePlaceholder = (width: number = 200, height: number = 200): string => {
        return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui" font-size="14">
          Loading...
        </text>
      </svg>
    `)}`;
    };

    const getErrorPlaceholder = (width: number = 200, height: number = 200): string => {
        return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#fef2f2"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#dc2626" font-family="system-ui" font-size="14">
          Failed to load
        </text>
      </svg>
    `)}`;
    };

    onMounted(() => {
    // Initialize observer
        observer.value = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const target = entry.target as HTMLElement;
                        const src = target.dataset.src;
                        if (src && !loadedImages.value.has(src)) {
                            loadImage(src);
                        }
                    }
                });
            },
            {
                rootMargin,
                threshold,
            },
        );
    });

    onUnmounted(() => {
        if (observer.value) {
            observer.value.disconnect();
        }
        observedElements.value.clear();
    });

    return {
        isImageLoaded,
        isImageLoading,
        isImageFailed,
        loadImage,
        observeElement,
        unobserveElement,
        preloadImage,
        preloadImages,
        clearCache,
        getImagePlaceholder,
        getErrorPlaceholder,
    };
}
