export default defineEventHandler(async (event) => {
    const path = event.context.params?.path || '';
    const method = event.method;

    const rawEnv = process.env.NUXT_PUBLIC_API_URL;
    let apiUrl = rawEnv || 'http://api.backhaus.local:3055/api/v1/dashboard';

    // Force http:// in local development -- the backend does not serve TLS
    if (apiUrl.startsWith('https://') && apiUrl.includes('.local')) {
        apiUrl = apiUrl.replace('https://', 'http://');
    }

    const targetUrl = `${apiUrl}/${path}`;
    const query = getQuery(event);
    const queryString = new URLSearchParams(query as Record<string, string>).toString();
    const fullTargetUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

    try {
        return await proxyRequest(event, fullTargetUrl);
    }
    catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const code = (err as NodeJS.ErrnoException)?.code;

        throw createError({
            statusCode: 502,
            statusMessage: 'Bad Gateway',
            message: `Proxy to backend failed: ${code || 'UNKNOWN'} - ${msg}`,
        });
    }
});
