<!-- pages/index.vue -->
<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] gap-12">
    <LandingIntroText />
    <LandingSkills />
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Home - Hiren',
  ogTitle: 'Welcome to Hiren - Web Developer',
  description: 'Discover the portfolio of Hiren, a web developer specializing in custom solutions and application development.',
  ogDescription: 'Explore my projects, services, and skills that showcase my expertise in web development.',
  ogImage: '/path/to/home-image.jpg',
  twitterCard: 'summary_large_image',
})
</script>