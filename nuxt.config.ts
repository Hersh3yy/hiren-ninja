// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' }
      ],
      link: [
        // SVG favicon first so modern browsers use it and preserve aspect ratio
        // (they letterbox rather than squish); .ico kept as a fallback.
        { rel: 'icon', type: 'image/svg+xml', href: '/hirshi2.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
      ],
      script: [
        {
          src: 'https://cloud.umami.is/script.js',
          'data-website-id': '377d79c7-f68d-430e-88cd-1ac5628995d5',
          // Only count the live site, not localhost or Netlify preview deploys.
          'data-domains': 'hiren.ninja',
          defer: true
        }
      ]
    }
  },
  modules: [
    'nuxt-site-config',
    '@nuxtjs/robots',
    '@nuxt/eslint',
    '@nuxtjs/sitemap',
  ],
  eslint: {
    config: {
      // Keep it non-intrusive: skip opinionated formatting/stylistic rules.
      // TypeScript + Vue support are enabled automatically by the module.
      stylistic: false
    }
  },
  css: [
    "~/assets/css/main.css"
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  // Nuxt 4 optimizations
  vite: {
    optimizeDeps: {
      include: [
        'three',
        'vanta/dist/vanta.birds.min',
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'graphql-tag',
      ]
    }
  },
  runtimeConfig: {
    clickupApiKey: process.env.CLICKUP_API_KEY ?? '',
    clickupListId: process.env.CLICKUP_LIST_ID ?? '',
    vamsApiUrl: process.env.VAMS_API_URL ?? '',
    vamsApiKey: process.env.VAMS_API_KEY ?? '',
  },
  nitro: {
    preset: 'netlify',
  },
  site: {
    url: 'https://hiren.ninja'
  },
  routeRules: {
    '/admin/**': { robots: false },
    '/dashboard/**': { robots: false },
    '/profile/**': { robots: false },
    '/experiments/**': { robots: false }
  },
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  compatibilityDate: "2024-10-12",
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true
  }
});