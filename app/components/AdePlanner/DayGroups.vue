<template>
  <div class="space-y-8">
    <div v-for="day in days" :key="day.key">
      <AtomsHeading :text="day.label" :level="3" size="lg" class="mb-3 uppercase tracking-wide" />
      <ul class="grid gap-3 md:grid-cols-2">
        <AdePlannerEventCard
          v-for="item in day.items"
          :key="item.event.id"
          :event="item.event"
          :artists="item.artists"
          :favorite="isFavorite(item.event.id)"
          @toggle-favorite="toggleFavorite(item.event, item.artists)"
        />
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useAdeFavorites } from '~/composables/useAdeFavorites.js'

defineProps({
  days: { type: Array, required: true }
})

const { isFavorite, toggleFavorite } = useAdeFavorites()
</script>
