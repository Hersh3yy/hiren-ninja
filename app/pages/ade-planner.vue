<template>
  <section class="w-full">
    <div class="container mx-auto px-4 sm:px-6 py-8 relative z-10">
      <AtomsHeading text="ADE Planner" :level="1" size="xl" variant="page" />
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
