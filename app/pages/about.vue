<template>
  <div class="container mx-auto px-4 sm:px-6 py-8 space-y-8">
    <div class="card">
      <OrganismsAboutBio />
    </div>
    <div class="card">
      <OrganismsAboutSkills />
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'About Me - Hiren',
  ogTitle: 'About Me - Hiren',
  description: 'Hiren is an AI & automation systems engineer based in Amsterdam, focused on AI integration, workflow automation, and high-performance backends.',
  ogDescription: 'Learn about my journey from full-stack development into AI integration, automation, and backend engineering.',
  ogImage: '/path/to/about-image.jpg',
  twitterCard: 'summary_large_image'
})
</script>
