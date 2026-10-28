// nuxt.config.ts
import tailwindcss from '@tailwindcss/vite'

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
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // One <link> in the head, not CSS @imports: the browser finds the font CSS in the
        // HTML right away instead of after downloading and parsing another stylesheet.
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;700&family=Sixtyfour+Convergence:SCAN,XELA,YELA@-16,60,-94&display=swap'
        }
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
  // Nuxt 4 optimizations
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        'three',
        'vanta/dist/vanta.birds.min',
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ]
    }
  },
  runtimeConfig: {
    clickupApiKey: process.env.CLICKUP_API_KEY ?? '',
    clickupListId: process.env.CLICKUP_LIST_ID ?? '',
    vamsApiUrl: process.env.VAMS_API_URL ?? '',
    vamsApiKey: process.env.VAMS_API_KEY ?? '',
    geminiApiKey: process.env.GEMINI_API_KEY ?? '',
    geminiModel: process.env.GEMINI_MODEL ?? 'gemini-3.8-flash',
  },
  nitro: {
    preset: 'netlify',
  },
  site: {
    url: 'https://hiren.ninja'
  },

  routeRules: {
    // Served from Netlify's CDN cache, rebuilt at most hourly: no cold server start for
    // a first visitor (the SEO audit measured 1.5s). Not /ade-planner: its ?tab= query
    // picks what the server renders, and a cached copy would ignore it.
    '/': { isr: 3600 },
    '/about': { isr: 3600 },
    '/services': { isr: 3600 },
    '/projects': { isr: 3600 },
    '/contact': { isr: 3600 },
    // ADE 2026 is over: /ade-planner is the recap, the old program pages point to it.
    '/ade-planner': { isr: 3600 },
    '/ade-planner/artist/**': { redirect: { to: '/ade-planner', statusCode: 301 } },
    '/ade-planner/genre/**': { redirect: { to: '/ade-planner', statusCode: 301 } },
    '/ade-planner/venue/**': { redirect: { to: '/ade-planner', statusCode: 301 } },
    '/ade-planner/free-parties': { redirect: { to: '/ade-planner', statusCode: 301 } },
    '/ade-planner/wednesday': { redirect: { to: '/ade-planner', statusCode: 301 } },
    '/ade-planner/thursday': { redirect: { to: '/ade-planner', statusCode: 301 } },
    '/ade-planner/friday': { redirect: { to: '/ade-planner', statusCode: 301 } },
    '/ade-planner/saturday': { redirect: { to: '/ade-planner', statusCode: 301 } },
    '/ade-planner/sunday': { redirect: { to: '/ade-planner', statusCode: 301 } },
    // The daytime programme (ADE Lab, ADE Pro) was dropped on 23 Oct; keep old links working.
    '/ade-planner/lab': { redirect: { to: '/ade-planner', statusCode: 301 } },
    '/ade-planner/pro': { redirect: { to: '/ade-planner', statusCode: 301 } },
    '/admin/**': { robots: false },
    '/dashboard/**': { robots: false },
    '/profile/**': { robots: false },
    // The experiments page (LED-sculpture generator) is gone; send old links home.
    '/experiments': { redirect: { to: '/', statusCode: 301 } },
    '/experiments/**': { redirect: { to: '/', statusCode: 301 } },
    // "Coming soon" stub: keep it out of search and the sitemap until it has posts.
    '/blog': { robots: false }
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