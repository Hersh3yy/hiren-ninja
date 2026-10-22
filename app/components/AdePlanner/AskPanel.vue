<template>
  <!-- No box of its own on phones: it already sits in the planner card, and a box in a box costs ~40px of width. -->
  <section class="space-y-4 sm:rounded-xl sm:border sm:border-accent-muted sm:p-4" aria-labelledby="ade-ask-heading">
    <div class="space-y-1">
      <AtomsHeading id="ade-ask-heading" text="Find events" :level="2" size="lg" class="uppercase tracking-wide" />
      <p class="text-sm text-content-muted">Say what you want, in your own words, or pick from the filters.</p>
    </div>

    <MoleculesPromptBox
      id="ade-ask-prompt"
      v-model="prompt"
      label="What are you looking for?"
      placeholder="e.g. techno in West tonight from 8pm"
      submit-text="Find events"
      :loading="isLoading"
      :disabled="!canSend"
      @submit="search"
    />

    <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
      <AtomsButton
        variant="link"
        :text="filtersOpen ? 'Hide filters' : `Or pick filters${activeFilters ? ` (${activeFilters})` : ''}`"
        :aria-expanded="filtersOpen"
        aria-controls="ade-ask-filters"
        @click="toggleFilters"
      />
      <AtomsButton v-if="result || activeFilters || prompt" variant="link-muted" text="Clear" @click="clear" />
    </div>

    <div v-show="filtersOpen" id="ade-ask-filters" class="space-y-3">
      <MoleculesChipGroup v-model="filters.day" label="Day" :options="days" @update:model-value="picked('day', $event)" />
      <MoleculesChipGroup v-model="filters.period" label="Time" :options="PERIOD_OPTIONS" @update:model-value="picked('period', $event)" />
      <MoleculesChipGroup v-model="filters.areas" multiple label="Where" :options="AREA_OPTIONS" @update:model-value="picked('area', $event)" />
      <MoleculesChipGroup v-model="filters.what" multiple label="What" :options="WHAT_OPTIONS" @update:model-value="picked('what', $event)" />
      <MoleculesChipGroup v-model="filters.budget" label="Price" :options="BUDGET_OPTIONS" @update:model-value="picked('budget', $event)" />
    </div>

    <div v-if="!result && !isLoading" class="space-y-2">
      <p class="text-xs font-bold uppercase tracking-wide text-content-muted">Try</p>
      <ul class="space-y-2 text-sm">
        <li v-for="example in EXAMPLES" :key="example">
          <AtomsButton variant="link" :text="example" class="text-left" @click="useExample(example)" />
        </li>
      </ul>
    </div>

    <AtomsLoader v-if="isLoading" type="dots" size="md" color="accent" text="Finding events" />
    <MoleculesStatusAlert :message="error" type="error" />

    <template v-if="result && !isLoading">
      <MoleculesStatusAlert v-if="result.source === 'rules' && prompt.trim()" message="Read with simple keyword matching: the AI helper is busy. Check the headings below match what you meant." />

      <div v-for="group in result.groups" :key="group.key" class="space-y-3">
        <div>
          <AtomsHeading :text="group.label" :level="3" size="md" class="uppercase tracking-wide" />
          <p class="text-xs text-content-muted">{{ group.summary }}</p>
        </div>

        <p v-if="!group.items.length" class="text-sm text-content-muted">
          Nothing open matches that. Try a different time or place, or clear a filter.
        </p>
        <AdePlannerDayGroups v-else :days="[toDay(group)]" :show-day-headings="false" />
        <p v-if="group.items.length && group.total > group.items.length" class="text-xs text-content-muted">
          Top {{ group.items.length }} of {{ group.total }}. Add a place, time or sound you like to narrow it down.
        </p>
      </div>
    </template>
  </section>
</template>

<script setup>
import { AREA_OPTIONS, BUDGET_OPTIONS, EXAMPLES, PERIOD_OPTIONS, WHAT_OPTIONS, dayOptions, useAdeAsk } from '~/composables/useAdeAsk.js'
import { track } from '~/utils/track'

const { prompt, filters, isLoading, error, result, activeFilters, canSend, run, useExample, clear } = useAdeAsk()

const filtersOpen = ref(false)
const days = ref([])
// The calendar is read in the browser so "Today" is the visitor's today, and never differs between server and client.
onMounted(() => { days.value = dayOptions() })

function toggleFilters() {
  filtersOpen.value = !filtersOpen.value
  if (filtersOpen.value) track('ade-ask-filters', { action: 'open' })
}

function picked(group, value) {
  const label = Array.isArray(value) ? value.join('-') : value
  if (label) track('ade-ask-filter', { group: `${group}-${label}` })
  // Filters alone answer instantly (no AI), so they update the list as you tap.
  // With a typed request, Find events re-reads it.
  nextTick(() => {
    if (prompt.value.trim()) return
    if (activeFilters.value) run()
    else result.value = null
  })
}

function search() {
  run()
}

// DayGroups lists days; one slot's answer is one "day" without a heading.
const toDay = group => ({
  key: group.key,
  label: group.label,
  items: group.items.map(item => ({ event: item.event, artists: [], note: item.why }))
})
</script>
