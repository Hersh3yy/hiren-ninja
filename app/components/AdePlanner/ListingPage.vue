<template>
  <section class="w-full">
    <div class="container mx-auto px-4 sm:px-6 py-8 relative z-10 space-y-6">
      <p class="text-sm font-bold uppercase tracking-widest text-accent">ADE 2026 · 21–25 Oct</p>
      <AtomsHeading :text="copy.h1" :level="1" size="2xl" variant="page" class="uppercase tracking-tight" />
      <MoleculesCard :blur="false">
        <div class="space-y-6">
          <p class="max-w-2xl text-content">{{ copy.intro }}</p>
          <p v-if="data.total > data.events.length" class="text-sm text-content-muted">
            Showing the {{ data.events.length }} most-viewed of {{ data.total }}. See every event per day below, or
            <AtomsButton variant="link" to="/ade-planner" text="paste your playlist" /> to see only your artists.
          </p>
          <p v-else class="text-sm text-content-muted">
            Want only your artists? <AtomsButton variant="link" to="/ade-planner" text="Paste your playlist in the ADE Planner" />.
          </p>
          <AdePlannerDayGroups :days="days" :heading-level="2" />
          <AdePlannerBrowseLinks />
        </div>
      </MoleculesCard>
      <p class="text-xs text-content-muted">Based on ADE's public program data. Not affiliated with Amsterdam Dance Event.</p>
    </div>
  </section>
</template>

<script setup>
// One template for the genre, venue, ADE Lab and ADE Pro pages: crawlable lists that
// answer searches like "techno ADE 2026" or "ADE Lab programme".
import { groupEventsByDay } from '~/composables/useAdePlanner.js'
import { track } from '~/utils/track'
import { eventJsonLd } from '../../../server/utils/ade-planner/seo'

const props = defineProps({
  kind: { type: String, required: true },
  slug: { type: String, default: '' }
})

const { data } = await useFetch(`/api/ade-planner/seo/listing/${props.kind}`, { query: { slug: props.slug } })
if (!data.value) throw createError({ statusCode: 404, statusMessage: 'Not on the ADE 2026 program', fatal: true })

const days = computed(() => groupEventsByDay(data.value.events.map(event => ({ event, artists: [] }))))

const copy = computed(() => {
  const { name, total, free } = data.value
  const freeText = free ? ` ${free} free.` : ''
  switch (props.kind) {
    case 'genre': return {
      h1: `${name} at ADE 2026`,
      title: `${name} at ADE 2026: ${total} ${name} parties & concerts`,
      intro: `Every ${name} party and concert at Amsterdam Dance Event 2026, 21–25 October: times, venues, lineups and tickets.${freeText}`
    }
    case 'venue': return {
      h1: `${name} at ADE 2026`,
      title: `${name} at ADE 2026: full program (${total} events)`,
      intro: `What's on at ${name} during Amsterdam Dance Event 2026: ${total} events with times, lineups and tickets.${freeText}`
    }
    case 'lab': return {
      h1: 'ADE Lab 2026 programme',
      title: `ADE Lab 2026 programme: ${total} demos, talks & listening sessions`,
      intro: `ADE Lab is ADE's programme for new artists and producers, mostly around Westergas in Westerpark (Het Ketelhuis, the Lab Village, Radio Radio): gear demos, masterclasses, listening sessions and talks. ${total} sessions, many free.`
    }
    default: return {
      h1: 'ADE Pro 2026 schedule',
      title: `ADE Pro 2026 schedule: ${total} talks, panels & networking sessions`,
      intro: `ADE Pro is the conference of Amsterdam Dance Event, mostly in the city centre (Felix Meritis, Andaz, Rosewood): ${total} talks, panels, interviews and networking sessions. Most need an ADE Pro pass.`
    }
  }
})

const url = `https://hiren.ninja/ade-planner/${props.kind}${props.slug ? `/${props.slug}` : ''}`
useSeoMeta({
  title: copy.value.title,
  ogTitle: copy.value.title,
  description: copy.value.intro.slice(0, 158),
  ogDescription: copy.value.intro.slice(0, 158),
  ogImage: 'https://hiren.ninja/og/og-ade.png',
  twitterCard: 'summary_large_image'
})
useHead({
  script: [{
    type: 'application/ld+json',
    key: 'ld-ade-listing',
    innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@graph': data.value.events.slice(0, 60).map(event => eventJsonLd(event, url)) })
  }]
})

onMounted(() => track('ade-landing', { kind: props.kind }))
</script>
