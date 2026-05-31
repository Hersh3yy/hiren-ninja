<template>
  <div class="bg-ink min-h-screen flex flex-col relative font-space-grotesk">
    <BackgroundsVantaBirds class="fixed inset-0 z-0" />
    <div class="fixed inset-0 bg-grid-pattern opacity-20 z-[1]"></div>
    <OrganismsSiteHeader class="z-20" />
    <main class="flex-grow flex justify-center items-start z-10 mt-16 w-full max-w-full">
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
    { name: 'theme-color', content: '#09090b' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
  ]
})
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Sixtyfour+Convergence:SCAN,XELA,YELA@-16,60,-94&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600&display=swap");
</style>
