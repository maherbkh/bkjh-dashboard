import tailwindcss from '@tailwindcss/vite';

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
    devtools: { enabled: true },
    app: {
        buildAssetsDir: '/static/',
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
            apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://api.backhaus.test:3055',
        },
    },
    build: {
        transpile: [
            'vee-validate',
            'vue-sonner',
        ],

    }, compatibilityDate: '2025-07-15',
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
                proxy: 'http://api.backhaus.test:3055/api/v1/media/**',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                    'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length, Content-Type',
                },
            },
            '/backend/**': {
                proxy: `${process.env.NUXT_PUBLIC_API_URL || 'http://api.backhaus-akademie.test:3055/api/v1/academy'}/**`,
            },
        },
    },
    vite: {
        plugins: [
            tailwindcss(),
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
