<template>
  <section class="space-y-4 rounded-xl border border-accent-muted p-4" aria-labelledby="ade-my-plan-heading">
    <AtomsHeading
      id="ade-my-plan-heading"
      :text="`My plan (${favorites.length})`"
      :level="2"
      size="xl"
      class="uppercase tracking-wide"
    />
    <p class="text-sm text-content-muted">
      {{ favorites.length ? 'Starred events, saved in this browser only.' : 'Star events (☆) in either tab to build your plan.' }}
    </p>
    <AdePlannerDayGroups v-if="favorites.length" :days="days" />
  </section>
</template>

<script setup>
import { useAdeFavorites } from '~/composables/useAdeFavorites.js'
import { groupEventsByDay } from '~/composables/useAdePlanner.js'

const { favorites } = useAdeFavorites()

const days = computed(() => groupEventsByDay(
  favorites.value.map(({ artists, ...event }) => ({ event, artists: artists ?? [] }))
))
</script>
