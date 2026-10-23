<template>
  <section class="w-full">
    <div class="container mx-auto px-4 sm:px-6 py-8 relative z-10 space-y-6">
      <p class="text-sm font-bold uppercase tracking-widest text-accent">ADE 2026 · {{ data.day.label }}</p>
      <AtomsHeading :text="`ADE ${data.day.label}: parties & concerts`" :level="1" size="2xl" variant="page" class="uppercase tracking-tight" />
      <MoleculesCard :blur="false">
        <div class="space-y-6">
          <p class="max-w-2xl text-content">
            All {{ data.parties.length }} Amsterdam Dance Event parties and concerts on {{ data.day.label }}, from afternoon
            to the next morning, with times, venues, lineups and tickets.
            {{ freeCount }} are free{{ cheapCount ? `, ${cheapCount} more under €25` : '' }}.
          </p>
          <p class="text-sm text-content-muted">
            Want only your artists? <AtomsButton variant="link" to="/ade-planner" text="Paste your playlist in the ADE Planner" />.
          </p>
          <AdePlannerDayGroups :days="days" :show-day-headings="false" />
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
import { ADE_DAYS, eventJsonLd } from '../../../server/utils/ade-planner/seo'
import { isFreeEntry, withinBudget } from '../../../server/utils/ade-planner/price'

definePageMeta({
  validate: route => ADE_DAYS.some(day => day.slug === route.params.day)
})

const route = useRoute()
const { data } = await useFetch(`/api/ade-planner/seo/day/${route.params.day}`)
if (!data.value) throw createError({ statusCode: 404, statusMessage: 'Not an ADE day', fatal: true })

const days = computed(() => groupEventsByDay(data.value.parties.map(event => ({ event, artists: [] }))))
const freeCount = computed(() => data.value.parties.filter(isFreeEntry).length)
const cheapCount = computed(() => data.value.parties.filter(event => !isFreeEntry(event) && withinBudget(event, '25')).length)
const url = `https://hiren.ninja/ade-planner/${route.params.day}`

const title = `ADE 2026 ${data.value.day.label}: all ${data.value.parties.length} parties & concerts`
const description = `Every Amsterdam Dance Event party and concert on ${data.value.day.label} 2026: times, venues, lineups, tickets. ${freeCount.value} free. Find your artists with the ADE Planner.`
useSeoMeta({ title, ogTitle: title, description, ogDescription: description, ogImage: 'https://hiren.ninja/og/og-ade.png', twitterCard: 'summary_large_image' })
useHead({
  script: [{
    type: 'application/ld+json',
    key: 'ld-ade-day',
    innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@graph': data.value.parties.slice(0, 60).map(event => eventJsonLd(event, url)) })
  }]
})

// Landing pages from search: counted per day in VAMS (ade-landing:day).
onMounted(() => track('ade-landing', { kind: 'day' }))
</script>
