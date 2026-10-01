<template>
  <div class="bg-ink min-h-screen flex flex-col relative font-sans">
    <!-- eslint-disable-next-line vue/no-restricted-html-elements -- a skip link is plain HTML by design: first focusable element, no component layer -->
    <a
      href="#main-content"
      class="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:z-50 focus-visible:top-2 focus-visible:left-2 focus-visible:bg-accent focus-visible:text-ink focus-visible:px-4 focus-visible:py-2 focus-visible:rounded"
    >
      Skip to content
    </a>
    <BackgroundsVantaBirds class="fixed inset-0 z-0" aria-hidden="true" :calm="route.path !== '/'" />
    <div class="fixed inset-0 bg-grid-pattern opacity-10 z-[1]" aria-hidden="true"/>
    <OrganismsSiteHeader class="z-20" />
    <main id="main-content" tabindex="-1" class="flex-grow flex justify-center items-start z-10 mt-16 w-full max-w-full outline-none">
      <NuxtPage />
    </main>
    <OrganismsSiteFooter class="mt-auto z-10" />
  </div>
</template>

<script setup>
// Full birds on the home hero only; on pages you read they'd pull focus, so they calm down.
const route = useRoute()

const SITE = 'https://hiren.ninja'
// One URL per page for search engines and share cards (no trailing slash, no query).
const canonicalUrl = computed(() => SITE + (route.path === '/' ? '/' : route.path.replace(/\/$/, '')))

// Who is behind the site, for search engines (schema.org JSON-LD). Facts only.
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE}/#hiren`,
      name: 'Hiren',
      jobTitle: 'Developer',
      url: SITE,
      email: 'mailto:hello@hiren.ninja',
      image: `${SITE}/mugshot-640.jpg`,
      address: { '@type': 'PostalAddress', addressLocality: 'Amsterdam', addressCountry: 'NL' },
      knowsAbout: ['Web development', 'Nuxt', 'Laravel', 'AI', 'Automation', 'Electronic music']
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${SITE}/#service`,
      name: 'Hiren Devs',
      url: SITE,
      email: 'hello@hiren.ninja',
      founder: { '@id': `${SITE}/#hiren` },
      areaServed: 'Worldwide',
      address: { '@type': 'PostalAddress', addressLocality: 'Amsterdam', addressCountry: 'NL' },
      description: 'Websites, software, AI and automation for artists, designers, agencies and growing businesses.'
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      name: 'Hiren.ninja',
      url: SITE,
      publisher: { '@id': `${SITE}/#service` },
      inLanguage: 'en'
    }
  ]
}

// Global SEO defaults; pages override title, description and share image with useSeoMeta.
useHead({
  link: [
    { rel: 'canonical', href: canonicalUrl, key: 'canonical' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
  ],
  script: [
    { type: 'application/ld+json', key: 'ld-site', innerHTML: JSON.stringify(STRUCTURED_DATA) }
  ],
  meta: [
    { property: 'og:url', content: canonicalUrl, key: 'og:url' },
    { property: 'og:image:width', content: '1200', key: 'og:image:width' },
    { property: 'og:image:height', content: '630', key: 'og:image:height' },
    { property: 'og:image:alt', content: 'Hiren Devs: technology for creative businesses', key: 'og:image:alt' },
    { name: 'twitter:image:alt', content: 'Hiren Devs: technology for creative businesses', key: 'twitter:image:alt' },
    { name: 'author', content: 'Hiren' },
    { property: 'og:site_name', content: 'Hiren.ninja' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    // Default share image; pages override it with useSeoMeta({ ogImage }).
    { property: 'og:image', content: 'https://hiren.ninja/og/og-site.png', key: 'og:image' },
    { name: 'theme-color', content: '#0d0d0d' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }
  ]
})
</script>

