<template>
  <section class="w-full">
    <div class="container mx-auto px-4 sm:px-6 py-8 relative z-10">
      <h1 class="page-title">Professional Services</h1>
      <p class="text-content-muted max-w-3xl mb-12">
        Four ways I can help: building and maintaining your digital presence, bringing AI into your
        business, automating the busywork, and keeping your data safe and fast. Every project starts
        with understanding what you actually need.
      </p>

      <OrganismsServicesGrid />
    </div>
  </section>
</template>

<script setup>
useSeoMeta({
  title: 'Professional Services - Hiren',
  ogTitle: 'Professional Services - Hiren',
  description: 'Website development, AI integration, workflow automation, and high-performance backend engineering.',
  ogDescription: 'Strategic technology services: AI integration, automation, and scalable backends.',
  ogImage: '/path/to/service-image.jpg',
  twitterCard: 'summary_large_image'
})
</script>
