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
    devtools: { enabled: true },
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
        hid: 'bkjh-erp-color-mode-script',
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
    compatibilityDate: '2025-07-15',
    // Reduce development warnings
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
        plugins: [
            tailwindcss() as any,
        ],
        optimizeDeps: {
            include: [
                'vue',
                'vue-router',
                'pinia',
                '@vueuse/core',
            ],
            exclude: [
                // Exclude heavy dependencies from pre-bundling
                '@morev/vue-transitions',
            ],
        },
        build: {
            sourcemap: false, // turn off sourcemaps
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
