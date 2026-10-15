<template>
  <nav aria-label="Browse ADE 2026" class="space-y-2">
    <p class="text-xs font-bold uppercase tracking-widest text-content-muted">Browse ADE 2026</p>
    <ul class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      <li v-for="day in ADE_DAYS" :key="day.slug">
        <AtomsButton variant="link" :to="`/ade-planner/${day.slug}`" :text="day.label" />
      </li>
      <li><AtomsButton variant="link" to="/ade-planner/free-parties" text="Free & cheap parties" /></li>
      <li v-if="showPlanner"><AtomsButton variant="link" to="/ade-planner" text="Plan from your playlist" /></li>
    </ul>
  </nav>
</template>

<script setup>
// Plain links between the planner and its day, budget and artist pages: they help
// visitors and let search engines find every page.
import { ADE_DAYS } from '../../../server/utils/ade-planner/seo'

defineProps({
  showPlanner: { type: Boolean, default: true }
})
</script>
