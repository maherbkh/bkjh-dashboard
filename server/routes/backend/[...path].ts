export default defineEventHandler(async (event) => {
    const path = event.context.params?.path || '';
    const config = useRuntimeConfig();
    // NUXT_PUBLIC_API_URL: full dashboard API base (e.g. https://api.example.com/api/v1/dashboard)
    // Production: use HTTPS and the production API host
    let apiBase = (config.public.apiUrl as string) || 'http://api.backhaus.local:3055/api/v1/dashboard';
    apiBase = apiBase.replace(/\/$/, '');

    // Force http:// only for .local — production must use HTTPS
    if (apiBase.includes('.local') && apiBase.startsWith('https://')) {
        apiBase = apiBase.replace('https://', 'http://');
    }

    const targetUrl = `${apiBase}/${path.replace(/^\//, '')}`;
    const query = getQuery(event);
    const queryString = new URLSearchParams(query as Record<string, string>).toString();
    const fullTargetUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

    try {
        return await proxyRequest(event, fullTargetUrl);
    }
    catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const code = (err as NodeJS.ErrnoException)?.code;
        console.error(`[Backend proxy] 502 ${path}: ${code} - ${msg}`);

        throw createError({
            statusCode: 502,
            statusMessage: 'Bad Gateway',
            message: `Proxy to backend failed: ${code || 'UNKNOWN'} - ${msg}`,
        });
    }
});
