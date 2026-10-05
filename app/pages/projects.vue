<template>
  <section class="w-full">
    <div class="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-[90vw]">
      <div class="mb-8 sm:mb-12">
        <AtomsHeading text="My Projects" :level="1" size="xl" variant="page" />
      </div>

      <OrganismsProjectsGrid />
    </div>
  </section>
</template>

<script setup>
useSeoMeta({
  title: 'Projects: Websites, Apps and Tools by Hiren, Amsterdam',
  ogTitle: 'Projects: Websites, Apps and Tools by Hiren, Amsterdam',
  description: 'Work by Hiren: websites, web apps and tools for artists, labels, clinics and creative businesses, including ADE Planner and the Qinip DJ app.',
  ogDescription: 'A selection of work — websites, tools, and digital products for creative professionals and growing businesses.',
  ogImage: 'https://hiren.ninja/og/og-site.png',
  twitterCard: 'summary_large_image'
})
</script>
