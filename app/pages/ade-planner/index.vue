<template>
  <section class="w-full">
    <div class="container mx-auto px-4 sm:px-6 py-8 relative z-10">
      <p class="text-sm font-bold uppercase tracking-widest text-accent">ADE · 21–25 Oct 2026</p>
      <AtomsHeading text="ADE Planner" :level="1" size="2xl" variant="page" class="uppercase tracking-tight" />
      <p class="mb-4 max-w-2xl text-sm text-content-muted">
        What's on at Amsterdam Dance Event, without the scroll. Paste a playlist to see where your artists play, ask in your own words, or pick a day and place in Schedule.
      </p>
      <MoleculesCard :blur="false">
        <AdePlannerTool />
      </MoleculesCard>

      <AdePlannerBrowseLinks class="mt-6" :show-planner="false" />

      <div class="mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
        <div v-for="item in FAQ" :key="item.q" class="space-y-1">
          <AtomsHeading :text="item.q" :level="2" size="sm" />
          <p class="text-sm text-content-muted">{{ item.a }}</p>
        </div>
      </div>

      <p class="mt-6 max-w-2xl text-sm text-content-muted">
        Built by Hiren, an Amsterdam developer who makes websites and tools for artists, labels and events.
        Need something like this?
        <AtomsButton variant="link" to="/contact" text="Get in touch" data-umami-event="ade-contact-click" />.
        <span class="mt-2 block text-xs">Based on ADE's public program data. Not affiliated with Amsterdam Dance Event.</span>
        <span class="mt-1 block text-xs">Searches are saved anonymously (the playlist link or names you enter, never who you are) to see what people look for. Your plan stays in your browser.</span>
      </p>
    </div>
  </section>
</template>

<script setup>
// Questions people search before ADE, answered in plain text (helps search, and people).
const FAQ = [
  { q: 'When is ADE 2026?', a: 'Amsterdam Dance Event 2026 runs Wednesday 21 to Sunday 25 October: about 1,800 parties, concerts, talks and sessions across Amsterdam.' },
  { q: 'Which of my artists play ADE?', a: 'Paste a Spotify, Apple Music, YouTube Music, Tidal or Deezer playlist (or type names) in Your artists above and the planner lists every show of your artists, by day.' },
  { q: 'Are there free ADE parties?', a: 'Yes, around 70 parties and concerts are free, and many more have tickets under €25. See Free & cheap parties, or pick Free in Schedule above.' },
  { q: 'What is the difference between ADE Pro and ADE Lab?', a: 'ADE Pro is the conference, mostly in the city centre (Felix Meritis, Andaz, Rosewood), and needs a Pro pass. ADE Lab is for new artists and producers, around Westergas in Westerpark, and is often free.' },
  { q: 'Is there an ADE timetable per day?', a: 'Yes: every day has its own page with all parties and concerts, from the afternoon until the next morning, and the daytime tab shows talks and sessions as a timetable.' },
  { q: 'Can I add ADE events to my calendar?', a: 'Save events to My plan, then export them as a calendar file (.ics), share your plan as a link, or download it as a story image.' },
]

useSeoMeta({
  title: 'ADE 2026 Timetable & Planner: Find Your Artists at Amsterdam Dance Event',
  ogTitle: 'ADE 2026 Timetable & Planner: Find Your Artists at Amsterdam Dance Event',
  description: 'The ADE 2026 timetable, searchable: paste a playlist to see which of your artists play Amsterdam Dance Event, when and where. Free parties, ADE Lab, ADE Pro, by day.',
  ogDescription: 'Paste a playlist. See which of your artists play ADE 2026, when and where.',
  ogImage: 'https://hiren.ninja/og/og-ade.png',
  ogImageAlt: 'ADE Planner: paste a playlist, see which of your artists play ADE 2026',
  twitterImageAlt: 'ADE Planner: paste a playlist, see which of your artists play ADE 2026',
  twitterCard: 'summary_large_image'
})

// A free web app, for search engines (schema.org JSON-LD).
useHead({
  script: [{
    type: 'application/ld+json',
    key: 'ld-ade-planner',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'ADE Planner',
      url: 'https://hiren.ninja/ade-planner',
      description: 'Paste a Spotify, Apple Music, YouTube Music, Tidal or Deezer playlist and see which of your artists play Amsterdam Dance Event 2026, when and where.',
      applicationCategory: 'EntertainmentApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      author: { '@id': 'https://hiren.ninja/#hiren' },
      about: { '@type': 'Event', name: 'Amsterdam Dance Event 2026', startDate: '2026-10-21', endDate: '2026-10-25', location: { '@type': 'Place', name: 'Amsterdam', address: 'Amsterdam, NL' } }
    })
  }]
})
</script>
