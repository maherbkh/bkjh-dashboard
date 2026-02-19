import dns from 'node:dns';
import { promisify } from 'node:util';

const dnsLookup = promisify(dns.lookup);

export default defineEventHandler(async () => {
    const apiUrl = process.env.NUXT_PUBLIC_API_URL || '(not set)';
    const results: Record<string, unknown> = {
        envValue: apiUrl,
        timestamp: new Date().toISOString(),
    };

    if (apiUrl === '(not set)') {
        return results;
    }

    let hostname: string;
    try {
        const parsed = new URL(apiUrl);
        hostname = parsed.hostname;
        results.parsedHost = parsed.host;
        results.parsedOrigin = parsed.origin;
        results.parsedPathname = parsed.pathname;
    }
    catch (err: unknown) {
        results.urlParseError = err instanceof Error ? err.message : String(err);
        return results;
    }

    try {
        const { address, family } = await dnsLookup(hostname);
        results.dns = { resolved: true, address, family };
    }
    catch (err: unknown) {
        results.dns = { resolved: false, error: err instanceof Error ? err.message : String(err) };
        return results;
    }

    const testUrl = `${apiUrl}/auth/admin-data`;
    results.probeUrl = testUrl;

    try {
        const start = Date.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(testUrl, { method: 'GET', signal: controller.signal });
        clearTimeout(timeout);
        results.probe = {
            ok: true,
            status: res.status,
            statusText: res.statusText,
            latencyMs: Date.now() - start,
        };
    }
    catch (err: unknown) {
        results.probe = {
            ok: false,
            error: err instanceof Error ? err.message : String(err),
            code: (err as NodeJS.ErrnoException)?.code,
        };
    }

    console.log('[PROXY-DEBUG]', JSON.stringify(results, null, 2));
    return results;
});
