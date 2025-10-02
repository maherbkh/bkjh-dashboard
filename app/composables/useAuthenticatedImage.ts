import { computed } from 'vue';

export function useAuthenticatedImage() {
    const getAuthenticatedImageUrl = (mediaFile: any) => {
        // Handle different URL field names from API response
        const url = mediaFile?.url || mediaFile?.fullUrl;
        if (!url) return '';
        
        // If the URL already includes authentication, return as is
        if (url.includes('token=') || url.includes('auth=')) {
            return url;
        }
        
        // If it's a full URL (http/https), extract the path and use proxy
        if (url.startsWith('http')) {
            // Extract the path from full URL like: http://api.backhaus.test:3055/api/v1/media/uuid/show
            // Convert to: /api/media/uuid/show
            const urlObj = new URL(url);
            const path = urlObj.pathname; // Gets /api/v1/media/uuid/show
            return path.replace('/api/v1/media/', '/api/media/');
        }
        
        // If the URL starts with /api/v1/media/, use the Nuxt proxy
        if (url.startsWith('/api/v1/media/')) {
            // Convert /api/v1/media/... to /api/media/... to use the proxy
            const proxyUrl = url.replace('/api/v1/media/', '/api/media/');
            return proxyUrl;
        }
        
        // For other URLs, use the proxy with the full URL
        return `/api/media/${url}`;
    };
    
    const getImageSrc = (mediaFile: any) => {
        // Try fullUrl first, then use proxy for url
        if (mediaFile?.fullUrl) {
            return mediaFile.fullUrl;
        }
        
        if (mediaFile?.url) {
            return getAuthenticatedImageUrl(mediaFile);
        }
        
        // If no URL fields are provided, construct the URL using uuid
        if (mediaFile?.uuid) {
            // Construct the URL using the uuid field
            const constructedUrl = `/api/media/${mediaFile.uuid}/show`;
            return getAuthenticatedImageUrl({ url: constructedUrl });
        }
        
        return '';
    };
    
    return {
        getAuthenticatedImageUrl,
        getImageSrc,
    };
}
