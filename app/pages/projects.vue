<template>
  <section class="w-full">
    <div class="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-[90vw]">
      <div class="mb-8 sm:mb-12">
        <h1 class="page-title">My Projects</h1>
      </div>

      <OrganismsProjectsGrid />
    </div>
  </section>
</template>

<script setup>
useHead({
  title: 'My Projects - Hiren',
  meta: [
    { name: 'description', content: 'Explore my projects showcasing AI integration, automation, and full-stack engineering.' },
    { property: 'og:title', content: 'My Projects - Hiren' },
    { property: 'og:description', content: 'Explore my projects showcasing AI integration, automation, and full-stack engineering.' },
    { property: 'og:image', content: '/path/to/project-image.jpg' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ]
})
</script>
