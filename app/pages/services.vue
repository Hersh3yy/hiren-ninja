<template>
  <section class="min-h-screen w-full">
    <div class="container mx-auto px-4 sm:px-6 py-8 relative z-10">
      <h1 class="page-title">Professional Services</h1>
      <p class="text-content-muted max-w-3xl mb-12">
        Strategic engineering across four pillars: building and maintaining web platforms, integrating
        AI into your business, automating the work that slows you down, and engineering backends that
        scale. Each engagement starts with understanding your objectives.
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
