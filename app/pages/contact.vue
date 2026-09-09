<template>
  <div class="container mx-auto px-4 sm:px-6 py-8 max-w-2xl">
    <AtomsHeading text="Contact Me" :level="1" size="xl" variant="page" />
    <p class="text-content-muted mb-8">
      Have a project in mind? Whether it's a new website, a tool powered by AI, or just
      removing the busywork from your day — send a note and I'll get back to you.
    </p>
    <OrganismsContactForm />
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Contact - Hiren',
  ogTitle: 'Contact - Hiren',
  description: 'Get in touch with Hiren — websites, AI tools, automation and digital products for creative businesses.',
  ogDescription: 'Available for projects and collaborations. Let\'s connect!',
  twitterCard: 'summary_large_image'
})
</script>
