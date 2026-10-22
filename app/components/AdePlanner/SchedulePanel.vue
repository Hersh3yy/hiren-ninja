<template>
  <section class="space-y-4" aria-label="Schedule">
    <p class="text-sm text-content-muted">Pick a day, then narrow it down. The list updates as you tap.</p>

    <div class="space-y-3">
      <MoleculesChipGroup :model-value="filters.day" label="Day" :options="days" @update:model-value="pickDay" />
      <MoleculesChipGroup v-model="filters.period" label="Time" :options="PERIOD_OPTIONS" @update:model-value="picked('period', $event)" />
      <MoleculesChipGroup v-model="filters.areas" multiple label="Where" :options="AREA_OPTIONS" @update:model-value="picked('area', $event)" />
      <MoleculesChipGroup v-model="filters.what" multiple label="What" :options="WHAT_OPTIONS" @update:model-value="picked('what', $event)" />
      <MoleculesChipGroup v-model="filters.budget" label="Price" :options="BUDGET_OPTIONS" @update:model-value="picked('budget', $event)" />
    </div>

    <MoleculesStatusAlert :message="error" type="error" />

    <div v-if="group" class="space-y-3" :aria-busy="isLoading">
      <div class="flex items-baseline justify-between gap-3 border-t border-border-subtle pt-4">
        <p class="text-sm">
          <span class="font-bold text-accent">{{ group.total }} {{ group.total === 1 ? 'event' : 'events' }}</span>
          <span class="text-content-muted"> · {{ group.summary }}</span>
        </p>
        <AtomsLoader v-if="isLoading" type="spinner" size="sm" color="accent" />
      </div>
      <p v-if="!group.items.length" class="text-sm text-content-muted">Nothing open matches all of these. Tap a filter again to drop it.</p>
      <AdePlannerDayGroups v-else :days="[toDay(group)]" :show-day-headings="false" />
      <p v-if="group.total > group.items.length" class="text-xs text-content-muted">
        Showing the {{ group.items.length }} most popular. Add a place or a kind of event to see the rest.
      </p>
    </div>
    <AtomsLoader v-else-if="isLoading" type="dots" size="md" color="accent" text="Loading the schedule" />
  </section>
</template>

<script setup>
import { AREA_OPTIONS, BUDGET_OPTIONS, PERIOD_OPTIONS, WHAT_OPTIONS, dayOptions, useAdeAsk } from '~/composables/useAdeAsk.js'
import { track } from '~/utils/track'

// Filters only, no AI: the same rules as Ask, a longer list, in time order.
const { filters, isLoading, error, result, run } = useAdeAsk({ limit: 120, source: 'schedule' })

const days = ref([])
const group = computed(() => result.value?.groups?.[0] ?? null)

function pickDay(value) {
  // There is always a day; tapping the picked one again keeps it.
  filters.day = value || filters.day
  picked('day', filters.day)
}

function picked(name, value) {
  const label = Array.isArray(value) ? value.join('-') : value
  if (label) track('ade-schedule-filter', { group: `${name}-${label}` })
  nextTick(run)
}

// The calendar is read in the browser, so "Today" is the visitor's today.
onMounted(() => {
  days.value = dayOptions()
  filters.day = days.value[0]?.value ?? ''
  run()
})

const toDay = item => ({
  key: item.key,
  label: item.label,
  items: item.items.map(entry => ({ event: entry.event, artists: [], note: entry.why }))
})
</script>
