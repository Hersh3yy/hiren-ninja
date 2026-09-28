<template>
  <div class="space-y-6">
    <p class="text-content-muted max-w-2xl">
      Talks, meetups, workshops, showcases, listening sessions and more, without the club nights.
      Search by interests or names, and narrow it down with filters.
    </p>

    <form class="flex flex-col gap-3 sm:flex-row sm:items-end" @submit.prevent="load()">
      <MoleculesFormField
        v-model="q"
        class="flex-1"
        label="Interests or names"
        name="ade-daytime-query"
        placeholder="labels, marketing, synths, Adam Beyer"
      />
      <AtomsButton type="submit" text="Search" :loading="isLoading" />
    </form>

    <AdePlannerFiltersDrawer
      :filters="filters"
      :facets="facets"
      :active="activeFilters"
      @toggle="toggle"
      @clear="clearFilters"
    />

    <MoleculesStatusAlert :message="error" type="error" />

    <p class="text-sm text-content-muted" aria-live="polite">
      {{ isLoading && !events.length ? 'Loading...' : `${total} ${total === 1 ? 'event' : 'events'}` }}
    </p>

    <AdePlannerDayGroups :days="days" />

    <div v-if="events.length < total" class="flex justify-center">
      <AtomsButton variant="outline" :text="`Show more (${total - events.length} left)`" :loading="isLoading" @click="load({ append: true })" />
    </div>
  </div>
</template>

<script setup>
import { groupEventsByDay } from '~/composables/useAdePlanner.js'
import { useDaytimeBrowse } from '~/composables/useDaytimeBrowse.js'

const props = defineProps({
  initialQuery: { type: String, default: '' }
})

const { q, filters, events, facets, total, isLoading, error, activeFilters, load, toggle, clearFilters } = useDaytimeBrowse(props.initialQuery)

const days = computed(() => groupEventsByDay(events.value.map(event => ({ event, artists: [] }))))

// Coming from the parties tab with your artists: search for them.
watch(() => props.initialQuery, (query) => {
  if (query) {
    q.value = query
    load()
  }
})

onMounted(() => load())
</script>
