<!-- app.vue -->
<template>
  <div class="bg-black min-h-screen flex flex-col relative font-space-grotesk">
    <div class="fixed inset-0 bg-grid-pattern opacity-20" style="z-index: 2"></div>
    <div id="vanta-background" class="fixed inset-0" style="z-index: 1"></div>
    <Header class="z-20" />
    <main class="flex-grow flex justify-center items-start z-10 mt-16 w-full max-w-full font-space-grotesk">
      <NuxtPage />
    </main>
    <Footer class="mt-auto z-10 font-space-grotesk" />
  </div>
</template>

<script setup>
// Global SEO defaults
useHead({
  titleTemplate: '%s | Hiren - Web Developer',
  meta: [
    { name: 'author', content: 'Hiren' },
    {
      name: 'description',
      content: 'Web developer specializing in custom solutions, data visualization, and application development in Amsterdam.'
    },
    // Default social media meta tags
    { property: 'og:site_name', content: 'Hiren.ninja' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    // PWA meta tags
    { name: 'theme-color', content: '#000000' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
  ],
  script: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js',
      callback: () => {
        // Initialize VANTA after both scripts are loaded
        if (typeof VANTA !== 'undefined') {
          VANTA.BIRDS({
            el: "#vanta-background",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color1: 0xfffe00,
            color2: 0x70707,
            birdSize: 0.7,
            wingSpan: 40.00,
            backgroundColor: 0x60707,
          })
        }
      }
    }
  ]
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Sixtyfour+Convergence:SCAN,XELA,YELA@-16,60,-94&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600&display=swap");

.page-title {
  @apply text-3xl sm:text-4xl font-bold text-yellow-300 mb-8;
}

.section-title {
  @apply text-2xl font-bold text-yellow-300 mb-4;
}

.bg-grid-pattern {
  background-image: linear-gradient(rgba(255, 255, 255, 0.35) 1px,
      transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}
</style>