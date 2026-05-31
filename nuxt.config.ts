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
          defer: true
        }
      ]
    }
  },
  modules: [
    '@nuxtjs/apollo',
    'nuxt-site-config',
    '@nuxtjs/robots',
    '@nuxt/eslint',
    // 'nuxt-simple-sitemap', // Temporarily disabled for Nuxt 4 compatibility
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
      include: ['three']
    }
  },
  apollo: {
    clients: {
      default: {
        // Endpoint and token are read from environment variables (see .env / .env.example).
        // Nuxt auto-loads .env, which is gitignored so the token stays out of source control.
        httpEndpoint: process.env.HYGRAPH_ENDPOINT ?? 'https://eu-central-1-shared-euc1-02.cdn.hygraph.com/content/clvkp3ut01ajw07wc38106mxt/master',
        httpLinkOptions: {
          headers: {
            'Authorization': `Bearer ${process.env.HYGRAPH_TOKEN ?? ''}`
          }
        }
      }
    },
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