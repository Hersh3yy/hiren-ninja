<template>
  <section class="w-full">
    <div class="container mx-auto px-4 sm:px-6 py-8 relative z-10">
      <h1 class="page-title">Services</h1>
      <p class="text-content-muted max-w-3xl mb-12">
        Whether you're an artist who needs a digital home, a founder drowning in manual work, or a
        business that wants to use AI without the hype — every project starts with understanding what
        you actually need and what success looks like for you.
      </p>

      <OrganismsServicesGrid />
    </div>
  </section>
</template>

<script setup>
useSeoMeta({
  title: 'Services - Hiren',
  ogTitle: 'Services - Hiren',
  description: 'Websites, practical AI, workflow automation, and reliable systems for creative businesses and growing teams.',
  ogDescription: 'Technology services for artists, designers, founders and creative businesses — websites, AI, automation and more.',
  ogImage: '/path/to/service-image.jpg',
  twitterCard: 'summary_large_image'
})
</script>
