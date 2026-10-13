<template>
  <section class="space-y-3 rounded-xl border border-accent-muted p-4" aria-labelledby="ade-free-heading">
    <AtomsHeading id="ade-free-heading" text="Free parties" :level="2" size="xl" class="uppercase tracking-wide" />
    <p class="text-sm text-content-muted">
      Every party and concert with free entry. "Free, get a ticket" means free, but claim a ticket first: they run out.
    </p>

    <AtomsLoader v-if="isLoading" type="spinner" size="md" color="accent" text="Finding free parties" />
    <MoleculesStatusAlert :message="error" type="error" />

    <template v-if="events.length">
      <div class="flex flex-wrap gap-2" role="group" aria-label="Filter free parties by genre">
        <AtomsChip
          v-for="{ genre, count } in genres"
          :key="genre"
          size="sm"
          :text="genre"
          :count="count"
          :pressed="genre === genreFilter"
          @click="genreFilter = genre === genreFilter ? '' : genre"
        />
      </div>
      <AdePlannerDayGroups :days="days" :heading-level="3" />
    </template>
  </section>
</template>

<script setup>
import { genreProfile, groupEventsByDay } from '~/composables/useAdePlanner.js'
import { track } from '~/utils/track'

const isLoading = ref(true)
const error = ref('')
const events = ref([])
const genreFilter = ref('')

const items = computed(() => events.value.map(event => ({ event, artists: [] })))
const genres = computed(() => genreProfile(items.value).slice(0, 8))
const days = computed(() => groupEventsByDay(genreFilter.value
  ? items.value.filter(({ event }) => event.genres?.includes(genreFilter.value))
  : items.value))

onMounted(async () => {
  try {
    events.value = await $fetch('/api/ade-planner/free')
    track('ade-free-open', { events: events.value.length })
  } catch {
    error.value = 'Could not load the free parties. Try again in a moment.'
  } finally {
    isLoading.value = false
  }
})
</script>
