<template>
  <div class="container mx-auto px-4 sm:px-6 py-8 space-y-8">
    <div class="card">
      <AboutBio />
    </div>
    <div class="card">
      <AboutSkills />
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'About Me - Hiren',
  ogTitle: 'About Me - Hiren',
  description: 'Learn more about Hiren, a web developer specializing in custom solutions.',
  ogDescription: 'Discover my journey, skills, and projects that showcase my expertise in web development.',
  ogImage: '/path/to/about-image.jpg',
  twitterCard: 'summary_large_image',
})
</script>
