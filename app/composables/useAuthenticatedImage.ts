import { computed } from 'vue';

export function useAuthenticatedImage() {
    const getAuthenticatedImageUrl = (mediaFile: any) => {
        // Handle different URL field names from API response
        const url = mediaFile?.url || mediaFile?.fullUrl;
        console.log('🖼️ [useAuthenticatedImage] getAuthenticatedImageUrl called with URL:', url);
        
        if (!url) {
            console.log('🖼️ [useAuthenticatedImage] No URL found, returning empty string');
            return '';
        }
        
        // If the URL already includes authentication, return as is
        if (url.includes('token=') || url.includes('auth=')) {
            console.log('🖼️ [useAuthenticatedImage] URL already has authentication, returning as is');
            return url;
        }
        
        // If it's a full URL (http/https), extract the path and use proxy
        if (url.startsWith('http')) {
            console.log('🖼️ [useAuthenticatedImage] Processing HTTP URL:', url);
            // Handle different backend URL patterns:
            // 1. http://api.backhaus.test:3055/api/v1/media/uuid/show -> /api/media/uuid/show
            // 2. http://api.backhaus.test:3055/uploads/public/... -> /get-media/...
            const urlObj = new URL(url);
            const path = urlObj.pathname;
            console.log('🖼️ [useAuthenticatedImage] Extracted path:', path);
            
            if (path.startsWith('/api/v1/media/')) {
                const result = path.replace('/api/v1/media/', '/api/media/');
                console.log('🖼️ [useAuthenticatedImage] API v1 media transformation:', result);
                return result;
            } else if (path.startsWith('/uploads/public/')) {
                const result = path.replace('/uploads/public/', '/get-media/');
                console.log('🖼️ [useAuthenticatedImage] Uploads public transformation:', result);
                return result;
            } else if (path.startsWith('/uploads/')) {
                const result = path.replace('/uploads/', '/api/media/');
                console.log('🖼️ [useAuthenticatedImage] Uploads transformation:', result);
                return result;
            }
            
            console.log('🖼️ [useAuthenticatedImage] No pattern matched, returning path:', path);
            return path;
        }
        
        // If the URL starts with /api/v1/media/, use the Nuxt proxy
        if (url.startsWith('/api/v1/media/')) {
            // Convert /api/v1/media/... to /api/media/... to use the proxy
            const result = url.replace('/api/v1/media/', '/api/media/');
            console.log('🖼️ [useAuthenticatedImage] API v1 media path transformation:', result);
            return result;
        }
        
        // If the URL starts with /uploads/public/, convert to /get-media/
        if (url.startsWith('/uploads/public/')) {
            const result = url.replace('/uploads/public/', '/get-media/');
            console.log('🖼️ [useAuthenticatedImage] Uploads public path transformation:', result);
            return result;
        }
        
        // If the URL starts with /uploads/, convert to /api/media/
        if (url.startsWith('/uploads/')) {
            const result = url.replace('/uploads/', '/api/media/');
            console.log('🖼️ [useAuthenticatedImage] Uploads path transformation:', result);
            return result;
        }
        
        // For other URLs, use the proxy with the full URL
        const result = `/api/media/${url}`;
        console.log('🖼️ [useAuthenticatedImage] Default transformation:', result);
        return result;
    };
    
    const getImageSrc = (mediaFile: any) => {
        console.log('🖼️ [useAuthenticatedImage] getImageSrc called with:', mediaFile);
        
        // Try fullUrl first, then use proxy for url
        if (mediaFile?.fullUrl) {
            console.log('🖼️ [useAuthenticatedImage] Using fullUrl:', mediaFile.fullUrl);
            return mediaFile.fullUrl;
        }
        
        if (mediaFile?.url) {
            const transformedUrl = getAuthenticatedImageUrl(mediaFile);
            console.log('🖼️ [useAuthenticatedImage] Transformed URL:', transformedUrl);
            return transformedUrl;
        }
        
        // If no URL fields are provided, construct the URL using uuid
        if (mediaFile?.uuid) {
            // Construct the URL using the uuid field
            const constructedUrl = `/api/media/${mediaFile.uuid}/show`;
            console.log('🖼️ [useAuthenticatedImage] Constructed URL:', constructedUrl);
            return getAuthenticatedImageUrl({ url: constructedUrl });
        }
        
        console.log('🖼️ [useAuthenticatedImage] No valid URL found, returning empty string');
        return '';
    };

    // New function to get direct image URL that bypasses IPX
    const getDirectImageSrc = (mediaFile: any) => {
        console.log('🖼️ [useAuthenticatedImage] getDirectImageSrc called with:', mediaFile);
        
        // Get the transformed URL
        const transformedUrl = getImageSrc(mediaFile);
        console.log('🖼️ [useAuthenticatedImage] Base transformed URL:', transformedUrl);
        
        // If it's already a full URL, return as is
        if (transformedUrl.startsWith('http')) {
            console.log('🖼️ [useAuthenticatedImage] Already full URL, returning as is');
            return transformedUrl;
        }
        
        // For relative URLs, construct the full URL to bypass IPX
        const fullUrl = `${window.location.origin}${transformedUrl}`;
        console.log('🖼️ [useAuthenticatedImage] Constructed full URL to bypass IPX:', fullUrl);
        return fullUrl;
    };
    
    return {
        getAuthenticatedImageUrl,
        getImageSrc,
        getDirectImageSrc,
    };
}
