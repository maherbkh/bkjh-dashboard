/**
 * Composable for handling internal media URL transformation to use Nuxt proxy
 * This is specifically for ticket attachments with internal media URLs
 */

export const useInternalMediaProxy = () => {
    /**
     * Transform internal media URL to use Nuxt proxy or return direct URL
     * @param originalUrl - The original backend media URL
     * @returns The proxy URL for internal media, or direct URL for other media
     */
    const getProxyUrl = (originalUrl: string): string => {
        if (!originalUrl) return originalUrl;

        // Check if it's already a proxy URL
        if (originalUrl.startsWith('/get-media-internal/')) {
            return originalUrl;
        }

        // Check if it's an internal media URL
        if (originalUrl.includes('/api/v1/media/internal/')) {
            try {
                // Parse the URL to extract path and query parameters
                const urlObj = new URL(originalUrl);
                const pathname = urlObj.pathname;

                // Extract the path after /api/v1/media/internal/
                const internalPath = pathname.replace('/api/v1/media/internal/', '');
                const query = urlObj.search;

                // Return proxy URL with preserved query parameters
                return `/get-media-internal/${internalPath}${query}`;
            }
            catch (error) {
                // If URL parsing fails, try simple string replacement
                const internalMediaPattern = /https?:\/\/[^/]+\/api\/v1\/media\/internal\/(.+)/;
                const match = originalUrl.match(internalMediaPattern);
                if (match) {
                    return `/get-media-internal/${match[1]}`;
                }
                // If transformation fails, return original URL
                console.warn('Failed to transform internal media URL:', originalUrl);
                return originalUrl;
            }
        }

        // For non-internal media URLs, return as-is (direct link)
        return originalUrl;
    };

    /**
     * Check if a URL is an internal media URL that should be proxied
     * @param url - The URL to check
     * @returns True if it's an internal media URL that should be proxied
     */
    const isInternalMediaUrl = (url: string): boolean => {
        return url.includes('/api/v1/media/internal/') || url.startsWith('/get-media-internal/');
    };

    return {
        getProxyUrl,
        isInternalMediaUrl,
    };
};

