<template>
  <section class="w-full">
    <div class="container mx-auto px-4 sm:px-6 py-8 relative z-10">
      <p class="text-sm font-bold uppercase tracking-widest text-accent">ADE · 21–25 Oct 2026</p>
      <AtomsHeading text="ADE Planner" :level="1" size="2xl" variant="page" class="uppercase tracking-tight" />
      <MoleculesCard>
        <AdePlannerTool />
      </MoleculesCard>
    </div>
  </section>
</template>

<script setup>
useSeoMeta({
  title: 'ADE Planner - Hiren',
  ogTitle: 'ADE Planner - Hiren',
  description: 'Paste a Spotify or Apple Music playlist and see which of your artists play Amsterdam Dance Event 2026, when and where.',
  ogDescription: 'Find your artists on the Amsterdam Dance Event 2026 lineup.',
  twitterCard: 'summary_large_image'
})
</script>
