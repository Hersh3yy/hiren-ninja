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
  title: 'About - Hiren',
  ogTitle: 'About - Hiren',
  description: 'Hiren is a developer based in Amsterdam who specialises in translating creative ideas into technology — for artists, designers, musicians and growing businesses.',
  ogDescription: 'From Sint Maarten to Amsterdam: a developer who speaks both creative and technical, building digital products for people with vision.',
  ogImage: '/path/to/about-image.jpg',
  twitterCard: 'summary_large_image'
})
</script>
