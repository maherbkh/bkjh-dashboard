/**
 * Composable for handling media URL transformation to use Nuxt proxy
 * This bypasses CORS issues by routing media requests through the frontend
 */

export const useMediaProxy = () => {
  /**
   * Transform backend media URL to use Nuxt proxy
   * @param originalUrl - The original backend media URL
   * @returns The proxy URL that routes through Nuxt
   */
  const getProxyUrl = (originalUrl: string): string => {
    if (!originalUrl) return originalUrl;
    
    // Check if it's already a proxy URL
    if (originalUrl.startsWith('/api/media/')) {
      return originalUrl;
    }
    
    // Transform backend URL to proxy URL
    // From: http://api.backhaus.test:3055/api/v1/media/internal/...
    // To: /api/media/internal/...
    const backendBaseUrl = 'http://api.backhaus.test:3055/api/v1/media/';
    
    if (originalUrl.startsWith(backendBaseUrl)) {
      return originalUrl.replace(backendBaseUrl, '/api/media/');
    }
    
    // If it doesn't match expected pattern, return as-is
    console.warn('Media URL does not match expected backend pattern:', originalUrl);
    return originalUrl;
  };

  /**
   * Check if a URL is a media URL that should be proxied
   * @param url - The URL to check
   * @returns True if it's a media URL that should be proxied
   */
  const isMediaUrl = (url: string): boolean => {
    return url.includes('/api/v1/media/') || url.startsWith('/api/media/');
  };

  /**
   * Get the original backend URL from a proxy URL
   * @param proxyUrl - The proxy URL
   * @returns The original backend URL
   */
  const getOriginalUrl = (proxyUrl: string): string => {
    if (!proxyUrl) return proxyUrl;
    
    // If it's already a backend URL, return as-is
    if (proxyUrl.startsWith('http://api.backhaus.test:3055/')) {
      return proxyUrl;
    }
    
    // Transform proxy URL back to backend URL
    if (proxyUrl.startsWith('/api/media/')) {
      return proxyUrl.replace('/api/media/', 'http://api.backhaus.test:3055/api/v1/media/');
    }
    
    return proxyUrl;
  };

  return {
    getProxyUrl,
    isMediaUrl,
    getOriginalUrl,
  };
};
