<template>
  <section class="w-full">
    <div class="container mx-auto px-4 sm:px-6 py-8 relative z-10">
      <p class="text-sm font-bold uppercase tracking-widest text-accent">ADE · 21–25 Oct 2026</p>
      <AtomsHeading text="ADE Planner" :level="1" size="2xl" variant="page" class="uppercase tracking-tight" />
      <MoleculesCard :blur="false">
        <AdePlannerTool />
      </MoleculesCard>

      <p class="mt-6 max-w-2xl text-sm text-content-muted">
        Built by Hiren, an Amsterdam developer who makes websites and tools for artists, labels and events.
        Need something like this?
        <NuxtLink to="/contact" class="text-accent underline underline-offset-2" data-umami-event="ade-contact-click">Get in touch</NuxtLink>.
        <span class="mt-2 block text-xs">Based on ADE's public program data. Not affiliated with Amsterdam Dance Event.</span>
      </p>
    </div>
  </section>
</template>

<script setup>
useSeoMeta({
  title: 'ADE Planner - Hiren',
  ogTitle: 'ADE Planner - Hiren',
  description: 'Paste a Spotify, Apple Music or YouTube Music playlist and see which of your artists play Amsterdam Dance Event 2026, when and where.',
  ogDescription: 'Paste a playlist. See which of your artists play ADE 2026, when and where.',
  ogImage: 'https://hiren.ninja/og/og-ade.png',
  ogUrl: 'https://hiren.ninja/ade-planner',
  twitterCard: 'summary_large_image'
})
</script>
