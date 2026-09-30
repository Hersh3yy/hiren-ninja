<template>
  <div class="bg-ink min-h-screen flex flex-col relative font-sans">
    <a
      href="#main-content"
      class="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:z-50 focus-visible:top-2 focus-visible:left-2 focus-visible:bg-accent focus-visible:text-ink focus-visible:px-4 focus-visible:py-2 focus-visible:rounded"
    >
      Skip to content
    </a>
    <BackgroundsVantaBirds class="fixed inset-0 z-0" aria-hidden="true" />
    <div class="fixed inset-0 bg-grid-pattern opacity-10 z-[1]" aria-hidden="true"/>
    <OrganismsSiteHeader class="z-20" />
    <main id="main-content" tabindex="-1" class="flex-grow flex justify-center items-start z-10 mt-16 w-full max-w-full outline-none">
      <NuxtPage />
    </main>
    <OrganismsSiteFooter class="mt-auto z-10" />
  </div>
</template>

<script setup>
// Global SEO defaults. No animation scripts live here anymore - the Vanta birds
// effect is fully owned by <BackgroundsVantaBirds /> (see app/components/backgrounds).
useHead({
  meta: [
    { name: 'author', content: 'Hiren' },
    { property: 'og:site_name', content: 'Hiren.ninja' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    // Default share image; pages override it with useSeoMeta({ ogImage }).
    { property: 'og:image', content: 'https://hiren.ninja/og/og-site.png', key: 'og:image' },
    { name: 'theme-color', content: '#0d0d0d' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }
  ],
  link: [
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
  ]
})
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Sixtyfour+Convergence:SCAN,XELA,YELA@-16,60,-94&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;700&display=swap");
</style>
