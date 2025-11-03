import { computed } from 'vue';

export function useAuthenticatedImage() {
    const getAuthenticatedImageUrl = (mediaFile: any) => {
        // Handle different URL field names from API response
        const url = mediaFile?.url || mediaFile?.fullUrl;

        if (!url) {
            return '';
        }

        // If the URL already includes authentication, return as is
        if (url.includes('token=') || url.includes('auth=')) {
            return url;
        }

        // If it's a full URL (http/https), extract the path and use proxy
        if (url.startsWith('http')) {
            // Handle different backend URL patterns:
            // 1. http://api.backhaus.test:3055/api/v1/media/uuid/show -> /api/media/uuid/show
            // 2. http://api.backhaus.test:3055/uploads/public/... -> /get-media/...
            const urlObj = new URL(url);
            const path = urlObj.pathname;

            if (path.startsWith('/api/v1/media/')) {
                const result = path.replace('/api/v1/media/', '/api/media/');
                return result;
            }
            else if (path.startsWith('/uploads/public/')) {
                const result = path.replace('/uploads/public/', '/get-media/');
                return result;
            }
            else if (path.startsWith('/uploads/')) {
                const result = path.replace('/uploads/', '/api/media/');
                return result;
            }

            return path;
        }

        // If the URL starts with /api/v1/media/, use the Nuxt proxy
        if (url.startsWith('/api/v1/media/')) {
            // Convert /api/v1/media/... to /api/media/... to use the proxy
            const result = url.replace('/api/v1/media/', '/api/media/');
            return result;
        }

        // If the URL starts with /uploads/public/, convert to /get-media/
        if (url.startsWith('/uploads/public/')) {
            const result = url.replace('/uploads/public/', '/get-media/');
            return result;
        }

        // If the URL starts with /uploads/, convert to /api/media/
        if (url.startsWith('/uploads/')) {
            const result = url.replace('/uploads/', '/api/media/');
            return result;
        }

        // For other URLs, check if they already start with /api/media/ to avoid double prefix
        if (url.startsWith('/api/media/')) {
            return url;
        }

        // For other URLs, use the proxy with the full URL
        const result = `/api/media/${url}`;
        return result;
    };

    const getImageSrc = (mediaFile: any) => {
    // Priority 1: Use the url field from API response
        if (mediaFile?.url) {
            const transformedUrl = getAuthenticatedImageUrl(mediaFile);
            return transformedUrl;
        }

        // Priority 2: Fallback to fullUrl if available
        if (mediaFile?.fullUrl) {
            const transformedUrl = getAuthenticatedImageUrl({ url: mediaFile.fullUrl });
            return transformedUrl;
        }

        // Priority 3: Construct URL from uuid (legacy support)
        if (mediaFile?.uuid) {
        // Construct the URL using the uuid field - return directly since it's already in the correct format
            const constructedUrl = `/api/media/${mediaFile.uuid}/show`;
            return constructedUrl; // Return directly, don't pass through getAuthenticatedImageUrl
        }

        return '';
    };

    // New function to get direct image URL that bypasses IPX
    const getDirectImageSrc = (mediaFile: any) => {
        console.log('🖼️ [useAuthenticatedImage] getDirectImageSrc input:', mediaFile);
        
        // Get the transformed URL
        let transformedUrl = getImageSrc(mediaFile);
        console.log('🖼️ [useAuthenticatedImage] transformedUrl after getImageSrc:', transformedUrl);

        // If it's already a full URL from the backend, transform it to use proxy
        if (transformedUrl.startsWith('http')) {
            // Check if it's a backend URL that needs proxying
            if (transformedUrl.includes('api.backhaus.test') || transformedUrl.includes('/uploads/')) {
                // Transform to use proxy instead
                transformedUrl = getAuthenticatedImageUrl({ url: transformedUrl });
                console.log('🖼️ [useAuthenticatedImage] transformedUrl after proxy:', transformedUrl);
            }
            else {
                // External URL, return as is
                console.log('🖼️ [useAuthenticatedImage] External URL, returning as is');
                return transformedUrl;
            }
        }

        // For relative URLs (proxy paths), construct the full URL to bypass IPX
        const fullUrl = `${window.location.origin}${transformedUrl}`;
        console.log('🖼️ [useAuthenticatedImage] Final fullUrl:', fullUrl);
        return fullUrl;
    };

    return {
        getAuthenticatedImageUrl,
        getImageSrc,
        getDirectImageSrc,
    };
}
