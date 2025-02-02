import { computed, ref } from "vue";

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
    'nuxt-site-config',
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
        httpEndpoint: 'https://eu-central-1-shared-euc1-02.cdn.hygraph.com/content/clvkp3ut01ajw07wc38106mxt/master',
        httpLinkOptions: {
          headers: {
            'Authorization': `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE3Mzg0NDExNDQsImF1ZCI6WyJodHRwczovL2FwaS1ldS1jZW50cmFsLTEtc2hhcmVkLWV1YzEtMDIuaHlncmFwaC5jb20vdjIvY2x2a3AzdXQwMWFqdzA3d2MzODEwNm14dC9tYXN0ZXIiLCJtYW5hZ2VtZW50LW5leHQuZ3JhcGhjbXMuY29tIl0sImlzcyI6Imh0dHBzOi8vbWFuYWdlbWVudC1ldS1jZW50cmFsLTEtc2hhcmVkLWV1YzEtMDIuaHlncmFwaC5jb20vIiwic3ViIjoiZTVmZTZkNjUtNjU0Ny00MTE1LWFkZmMtOGMxZjc1MjZlYmU4IiwianRpIjoiY202bW15enMzMGo1ZTA4djBhNmtzN29qMyJ9.cSp6N3mYIq-N5ocsuWiuyXvQluz8lufXMgPMD1kXs4mBr2VNkC_h1A-AWZ6-bA-ktx4wuZPBslO8L_3sUe0jA6Jq_Sqa5zsUo1fYkGOjATahGro9nISDbVo2Yjyp6-2Wck-xgzWxfHogFtceYI6Wrma9kK3LtMp-RESA0xmWqgsusFIHe5HA4LW19R07nBvedRLoxDGfRzX5FpI4fY9slwIDC4UfgWQ4fNWBl6o6df1Xl3kobKxTobTMCSaWxiKUzWvQirYWGxiwzM7wsptDb9Lris4G8Da5UzwHE10-ewqJgoECugx9oJhSV8Bd4pgHq3PxRKFj3IFm0w-tHnUQHoNmQEIOb4xchgRJvuOm5PTWMZIX6V-gIBgkqtS-jBZygXQ2eciHV6TTvp7i7bu_xr6BvcPK0KjIGF4VhlYIFlYgVlqjpwVkMwv1CAsMbdi7-znzcPlknnvp4NyQoVcu5S4gS4mXAER6k7tUVdmLZAYdAFsAfBtsdcu9Hct2McNvEUoX1trJRz9hWuHgL3Se6H1A6eSlCip09j2QioE7ixd4QC4A9MmJV5qd__Fkl_KLMcYlUfp3AVjL0psmHl7dNJ2NWEl35r1Qzf9VPtsCiQjmKMsp5nv83YTaqNuY3I7Xy-sU7rrpn-JKU30uanclw26ShdfbIjbKTpmn6JTN3lg`
          }
        }
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