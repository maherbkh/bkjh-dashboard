import tailwindcss from '@tailwindcss/vite';

// Media proxy base URL (build-time: from env so production uses real API host)
const mediaProxyBase = (() => {
    const url = process.env.NUXT_PUBLIC_API_BASE_URL || process.env.NUXT_PUBLIC_API_URL || 'https://api.backhaus.de/api/v1';
    try {
        return new URL(url).origin;
    }
    catch {
        return 'http://api.backhaus.local:3055';
    }
})();

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

    modules: [
        '@nuxt/eslint',
        '@nuxt/fonts',
        '@nuxt/icon',
        '@nuxt/image',
        '@nuxt/scripts',
        'shadcn-nuxt',
        '@morev/vue-transitions/nuxt',
        '@nuxtjs/color-mode',
        '@nuxtjs/i18n',
        '@pinia/nuxt',
        'dayjs-nuxt',
    ],
    ssr: false,
    imports: {
        dirs: ['types', 'utils'],
    },
    // Production: keep devtools off (smaller surface, no dev-only integration in prod).
    devtools: { enabled: import.meta.dev },
    app: {
        rootAttrs: {
            id: '__bkjh_dashboard_app',
        },
        pageTransition: {
            name: 'fade',
            mode: 'out-in',
            duration: 300,
        },
        layoutTransition: {
            name: 'fade',
            mode: 'out-in',
            duration: 300,
        },
    },
    css: ['~/assets/css/main.css', 'vue-sonner/style.css'],
    colorMode: {
        preference: 'system', // default value of $colorMode.preference
        fallback: 'dark', // fallback value if not system preference found
        globalName: '__BKJH_ERP_COLOR_MODE__',
        componentName: 'ColorScheme',
        classPrefix: '',
        classSuffix: '',
        storage: 'localStorage', // or 'sessionStorage' or 'cookie'
        storageKey: 'bkjh-erp-color-mode',
    }, // Disable SSR this project uses CSR
    runtimeConfig: {
        public: {
            apiUrl: process.env.NUXT_PUBLIC_API_URL || 'https://api.backhaus.de/api/v1/dashboard',
            appUrl: process.env.NUXT_PUBLIC_APP_URL || 'https://dashboard.backhaus.de',
            apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'https://api.backhaus.de/api/v1',
            // Use NUXT_PUBLIC_WEBSOCKET_BASE_URL for runtime override; WEBSOCKET_BASE_URL is build-time only.
            // Value must be http(s):// — ws(s):// is coerced at runtime in the socket initializer.
            websocketBaseUrl: process.env.NUXT_PUBLIC_WEBSOCKET_BASE_URL || process.env.WEBSOCKET_BASE_URL || mediaProxyBase,
        },
    },
    build: {
        transpile: [
            'vee-validate',
            'vue-sonner',
        ],
    },
    routeRules: {
        '/*/**': {
            ssr: false, // everything under it
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
            // Disable all caching at route level
            prerender: false,
        },
    },
    // Vite 7 + Nuxt 4.4+: internal component plugins may log SOURCEMAP_BROKEN / "Sourcemap is likely to be incorrect"
    // if the client build disables sourcemaps entirely. Use "hidden" so maps exist for the toolchain without
    // exposing //# sourceMappingURL to browsers. See https://github.com/nuxt/nuxt/issues/34530
    sourcemap: {
        client: 'hidden',
        server: false,
    },
    experimental: {
        viteEnvironmentApi: true,
    },
    compatibilityDate: '2026-05-11',
    nitro: {
        experimental: {
            wasm: false,
        },
        compressPublicAssets: true,
        minify: true,
        routeRules: {
            '/get-geoip/**': {
                proxy: `http://ip-api.com/json/**`,
            },
            '/api/media/**': {
                proxy: `${mediaProxyBase}/api/v1/media/**`,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                    'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length, Content-Type',
                },
            },
            '/get-media-internal/**': {
                proxy: `${mediaProxyBase}/api/v1/media/internal/**`,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                    'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length, Content-Type',
                },
            },
            '/get-media/': {
                redirect: {
                    to: '/api/get-media-blocked',
                    statusCode: 404,
                },
            },
            '/get-media/**': {
                proxy: `${mediaProxyBase}/uploads/public/**`,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                    'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length, Content-Type',
                },
            },
        },
    },
    vite: {
        // Dev-only; aligns CSS tooling with source maps (Tailwind/Vite DX). Does not control prod CSS map behavior.
        css: {
            devSourcemap: true,
        },
        build: {
            // Avoid nuxt:module-preload-polyfill transform + Rollup SOURCEMAP_BROKEN noise on Vite 7.
            // Preload hints still apply; only the legacy polyfill for ancient browsers without rel=modulepreload is skipped.
            // Re-enable polyfill: true if you must support very old browsers or embedded WebViews without modulepreload.
            modulePreload: {
                polyfill: false,
            },
        },
        resolve: {
            dedupe: [
                'vue',
                '@vue/runtime-core',
                '@vue/runtime-dom',
                '@vue/shared',
            ],
        },
        plugins: [
            tailwindcss() as any,
        ],
        optimizeDeps: {
            include: [
                '@vuepic/vue-datepicker',
                'date-fns/locale',
                '@tiptap/vue-3',
                '@tiptap/starter-kit',
                '@tiptap/extension-underline',
                '@tiptap/extension-image',
                '@tiptap/extension-text-align',
                '@tiptap/extension-text-style',
                '@tiptap/extension-color',
                '@tiptap/extension-link',
                '@tiptap/extension-character-count',
                '@vue/devtools-core',
                '@vue/devtools-kit',
                'dayjs', // CJS
                'dayjs/plugin/updateLocale', // CJS
                'dayjs/locale/en', // CJS
                'dayjs/locale/de', // CJS
                'dayjs/plugin/relativeTime', // CJS
                'dayjs/plugin/utc', // CJS
                'dayjs/plugin/timezone', // CJS
                'dayjs/plugin/customParseFormat', // CJS
                'dayjs/plugin/advancedFormat', // CJS
                '@vueuse/core',
                '@unovis/ts',
                'reka-ui',
                'class-variance-authority',
                'clsx',
                'tailwind-merge',
                '@unovis/vue',
                'zod',
                '@vee-validate/zod',
                'socket.io-client',
            ],
        },
    },
    dayjs: {
        locales: ['en', 'de'],
        plugins: ['relativeTime', 'utc', 'timezone', 'customParseFormat', 'advancedFormat'],
        defaultLocale: 'de',
        defaultTimezone: 'Europe/Berlin',
    },

    eslint: {
        config: {
            stylistic: {
                indent: 4,
                semi: true,
            },
        },
    },
    fonts: {
        families: [
            {
                name: 'Roboto',
                provider: 'google',
                weights: ['100 900'],
                styles: ['normal', 'italic'],
            },
        ],
    },
    i18n: {
        strategy: 'no_prefix',
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: 'bkjh_language',
            redirectOn: 'root',
        },
        defaultLocale: 'de',
        locales: [
            { code: 'en', name: 'English', file: 'en.json' },
            { code: 'de', name: 'Deutsch', file: 'de.json' },
        ],
    },
    pinia: {
        storesDirs: ['~/stores/**'],
    },
    shadcn: {
        prefix: '',
        componentDir: '~/components/ui',
    },

});
