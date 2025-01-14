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
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
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
    '@nuxtjs/robots',
    'nuxt-simple-sitemap',
  ],
  css: [
    "~/assets/css/main.css"
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  apollo: {
    clients: {
      default: {
        httpEndpoint: 'https://spacex-production.up.railway.app'
      }
    },
  },
  site: {
    url: 'https://hiren.ninja'
  },
  routeRules: {
    '/admin/**': { index: false },
    '/dashboard/**': { index: false },
    '/profile/**': { index: false }
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