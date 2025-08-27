import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false, // Disable SSR this project uses CSR
  // Reduce development warnings
  nitro: {
    experimental: {
      wasm: false,
    },
    compressPublicAssets: true,
    minify: true,
    routeRules: {
        '/backend/**': {
            proxy: `${process.env.API_URL ?? 'https://api.backhaus.de'}/**`,
        },
        '/get-geoip/**': {
            proxy: `http://ip-api.com/json/**`,
        },
    },
  },
  css: ['~/assets/css/main.css', 'vue-sonner/style.css'],
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
  ],
  app: {
    buildAssetsDir: '/static/',
    rootAttrs: {
      id: "__bkjh_dashboard_app"
    },
    pageTransition: {
      name: 'fade',
      mode: 'out-in',
      duration: 300
    },
    layoutTransition: {
      name: 'fade',
      mode: 'out-in',
      duration: 300
    }
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
      sourcemap: false,  // turn off sourcemaps
    },
  },
  build: {
    transpile: [
      'vee-validate',
      'vue-sonner',
    ],
    
  },
  shadcn: {
    prefix: '',
    componentDir: '~/components/ui'
  },
  pinia: {
    storesDirs: ['~/stores/**'],
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
  },

})