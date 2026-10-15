<template>
  <section class="w-full">
    <div class="container mx-auto px-4 sm:px-6 py-8 relative z-10 space-y-6">
      <p class="text-sm font-bold uppercase tracking-widest text-accent">ADE 2026 · 21–25 Oct</p>
      <AtomsHeading :text="`${data.artist.name} at ADE 2026`" :level="1" size="2xl" variant="page" class="uppercase tracking-tight" />
      <MoleculesCard :blur="false">
        <div class="space-y-6">
          <p class="max-w-2xl text-content">
            {{ summary }}
          </p>
          <AdePlannerDayGroups :days="days" />
          <p class="text-sm text-content-muted">
            More of your artists at ADE? <AtomsButton variant="link" to="/ade-planner" text="Paste your playlist in the ADE Planner" />
            and see who plays when and where.
            <AtomsButton variant="link-muted" :href="data.artist.adeUrl" external :text="`${data.artist.name} on the ADE website`" />
          </p>
          <AdePlannerBrowseLinks />
        </div>
      </MoleculesCard>
      <p class="text-xs text-content-muted">Based on ADE's public program data. Not affiliated with Amsterdam Dance Event.</p>
    </div>
  </section>
</template>

<script setup>
import { groupEventsByDay } from '~/composables/useAdePlanner.js'
import { track } from '~/utils/track'
import { eventJsonLd } from '../../../../server/utils/ade-planner/seo'

const route = useRoute()
const { data } = await useFetch(`/api/ade-planner/seo/artist/${route.params.slug}`)
if (!data.value) throw createError({ statusCode: 404, statusMessage: 'Not on the ADE 2026 lineup', fatal: true })

const name = data.value.artist.name
const events = computed(() => data.value.events)
const days = computed(() => groupEventsByDay(events.value.map(event => ({ event, artists: [name] }))))
const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', weekday: 'long', day: 'numeric', month: 'long' })
const shows = events.value.length
const summary = computed(() => `${name} ${data.value.artist.role === 'speaker' ? 'speaks' : 'plays'} Amsterdam Dance Event 2026 ${shows === 1 ? 'once' : `${shows} times`}: `
  + events.value.slice(0, 4).map(event => `${event.title} at ${event.venue || 'a venue to be announced'} (${weekday.format(new Date(event.startsAt))})`).join('; ')
  + (shows > 4 ? `, and ${shows - 4} more.` : '.'))

const url = `https://hiren.ninja/ade-planner/artist/${route.params.slug}`
const title = `${name} at ADE 2026: when & where${shows > 1 ? ` (${shows} shows)` : ''}`
const description = summary.value.slice(0, 155)
useSeoMeta({ title, ogTitle: title, description, ogDescription: description, ogImage: 'https://hiren.ninja/og/og-ade.png', twitterCard: 'summary_large_image' })
useHead({
  script: [{
    type: 'application/ld+json',
    key: 'ld-ade-artist',
    innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@graph': events.value.map(event => eventJsonLd(event, url)) })
  }]
})

// Landing pages from search: counted per day in VAMS (ade-landing:artist).
onMounted(() => track('ade-landing', { kind: 'artist' }))
</script>
