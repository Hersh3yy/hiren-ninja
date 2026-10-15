<template>
  <section class="w-full">
    <div class="container mx-auto px-4 sm:px-6 py-8 relative z-10 space-y-6">
      <p class="text-sm font-bold uppercase tracking-widest text-accent">ADE 2026 · 21–25 Oct</p>
      <AtomsHeading text="Free & cheap ADE parties" :level="1" size="2xl" variant="page" class="uppercase tracking-tight" />
      <MoleculesCard :blur="false">
        <div class="space-y-6">
          <p class="max-w-2xl text-content">
            In Amsterdam for ADE but not paying €100 for a night? {{ free.length }} Amsterdam Dance Event 2026 parties and
            concerts are free, and {{ cheap.length }} more have tickets under €25. "Free, get a ticket" is free, but claim it first.
          </p>
          <AtomsHeading text="Free parties" :level="2" size="lg" class="uppercase tracking-wide" />
          <AdePlannerDayGroups :days="freeDays" :heading-level="3" />
          <AtomsHeading text="Under €25" :level="2" size="lg" class="uppercase tracking-wide" />
          <p class="text-sm text-content-muted">Cheapest ticket on sale at Weeztix or Resident Advisor; parties sold elsewhere aren't priced here.</p>
          <AdePlannerDayGroups :days="cheapDays" :heading-level="3" />
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
import { eventJsonLd } from '../../../server/utils/ade-planner/seo'
import { isFreeEntry } from '../../../server/utils/ade-planner/price'

const { data } = await useFetch('/api/ade-planner/budget')
const events = computed(() => data.value ?? [])
const free = computed(() => events.value.filter(isFreeEntry))
const cheap = computed(() => events.value.filter(event => !isFreeEntry(event) && event.priceFrom < 25))
const freeDays = computed(() => groupEventsByDay(free.value.map(event => ({ event, artists: [] }))))
const cheapDays = computed(() => groupEventsByDay(cheap.value.map(event => ({ event, artists: [] }))))

const title = `Free ADE 2026 parties: ${free.value.length} free parties & concerts, by day`
const description = `Every free Amsterdam Dance Event 2026 party and concert, plus ${cheap.value.length} with tickets under €25: times, venues, lineups. For visitors who want ADE without a €100 ticket.`
useSeoMeta({ title, ogTitle: title, description, ogDescription: description, ogImage: 'https://hiren.ninja/og/og-ade.png', twitterCard: 'summary_large_image' })
useHead({
  script: [{
    type: 'application/ld+json',
    key: 'ld-ade-free',
    innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@graph': free.value.map(event => eventJsonLd(event, 'https://hiren.ninja/ade-planner/free-parties')) })
  }]
})

// Landing pages from search: counted per day in VAMS (ade-landing:free).
onMounted(() => track('ade-landing', { kind: 'free' }))
</script>
