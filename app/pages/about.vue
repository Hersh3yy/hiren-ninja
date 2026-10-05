<template>
  <div class="container mx-auto px-4 sm:px-6 py-8 space-y-8">
    <h1 class="sr-only">About Hiren</h1>
    <MoleculesCard>
      <OrganismsAboutBio />
    </MoleculesCard>
    <MoleculesCard>
      <OrganismsAboutSkills />
    </MoleculesCard>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'About Hiren: Amsterdam Developer for Creative Businesses',
  ogTitle: 'About Hiren: Amsterdam Developer for Creative Businesses',
  description: 'Hiren is a developer based in Amsterdam who specialises in translating creative ideas into technology — for artists, designers, musicians and growing businesses.',
  ogDescription: 'From Sint Maarten to Amsterdam: a developer who speaks both creative and technical, building digital products for people with vision.',
  ogImage: 'https://hiren.ninja/og/og-site.png',
  twitterCard: 'summary_large_image'
})
</script>
