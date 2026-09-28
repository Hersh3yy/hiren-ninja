<template>
  <section v-if="favorites.length" class="space-y-4 rounded-xl border border-accent-muted p-4" aria-labelledby="ade-my-plan-heading">
    <AtomsHeading
      id="ade-my-plan-heading"
      :text="`My plan (${favorites.length})`"
      :level="2"
      size="xl"
      class="uppercase tracking-wide"
    />
    <p class="text-sm text-content-muted">Starred events, saved in this browser only.</p>
    <AdePlannerDayGroups :days="days" />
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
