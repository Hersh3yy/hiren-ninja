<template>
  <nav aria-label="Browse ADE 2026" class="space-y-2">
    <p class="text-xs font-bold uppercase tracking-widest text-content-muted">Browse ADE 2026</p>
    <ul class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      <li v-for="day in ADE_DAYS" :key="day.slug">
        <AtomsButton variant="link" :to="`/ade-planner/${day.slug}`" :text="day.label" />
      </li>
      <li><AtomsButton variant="link" to="/ade-planner/free-parties" text="Free & cheap parties" /></li>
      <li><AtomsButton variant="link" to="/ade-planner/lab" text="ADE Lab" /></li>
      <li><AtomsButton variant="link" to="/ade-planner/pro" text="ADE Pro" /></li>
      <li v-if="showPlanner"><AtomsButton variant="link" to="/ade-planner" text="Plan from your playlist" /></li>
    </ul>
    <ul class="flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-label="Parties by genre">
      <li v-for="genre in GENRES" :key="genre.slug">
        <AtomsButton variant="link-muted" :to="`/ade-planner/genre/${genre.slug}`" :text="genre.label" />
      </li>
    </ul>
  </nav>
</template>

<script setup>
// Plain links between the planner and its day, budget and artist pages: they help
// visitors and let search engines find every page.
import { ADE_DAYS } from '../../../server/utils/ade-planner/seo'

// The biggest ADE genres; the full list is in the sitemap.
const GENRES = [
  ['house', 'House'], ['techno', 'Techno'], ['tech-house', 'Tech house'], ['deep-house', 'Deep house'],
  ['trance', 'Trance'], ['disco', 'Disco'], ['afro-house', 'Afro house'], ['melodic-house', 'Melodic house'],
  ['hard-techno', 'Hard techno'], ['hard-dance', 'Hard dance'], ['bass-and-uk', 'Bass & UK'], ['ambient', 'Ambient']
].map(([slug, label]) => ({ slug, label }))

defineProps({
  showPlanner: { type: Boolean, default: true }
})
</script>
