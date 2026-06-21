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
useSeoMeta({
  title: 'Projects - Hiren',
  ogTitle: 'Projects - Hiren',
  description: 'A selection of work — websites, tools, and digital products for creative professionals and growing businesses.',
  ogDescription: 'A selection of work — websites, tools, and digital products for creative professionals and growing businesses.',
  ogImage: '/path/to/project-image.jpg',
  twitterCard: 'summary_large_image'
})
</script>
