<template>
  <section class="space-y-4 rounded-xl border border-accent-muted p-4" aria-labelledby="ade-budget-heading">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <AtomsHeading id="ade-budget-heading" :text="heading" :level="2" size="xl" class="uppercase tracking-wide" />
      <AtomsButton variant="ghost" size="sm" text="Close" @click="$emit('close')" />
    </div>
    <p class="text-sm text-content-muted">
      {{ budget === 'free' ? '"Free, get a ticket" is free, but claim it first: they run out.' : 'Free parties included. Prices are the cheapest ticket on sale at Weeztix and Resident Advisor; parties sold elsewhere only show up when they\'re free.' }}
    </p>

    <AtomsLoader v-if="isLoading" type="spinner" size="md" color="accent" text="Finding cheap nights" />
    <MoleculesStatusAlert :message="error" type="error" />

    <template v-if="events.length">
      <AtomsButton
        variant="ghost"
        size="sm"
        :text="showMore ? 'Fewer filters' : `More filters${activeCount ? ` (${activeCount})` : ''}`"
        :aria-expanded="showMore"
        aria-controls="ade-budget-more"
        @click="showMore = !showMore"
      />
      <div v-show="showMore" id="ade-budget-more" class="space-y-3">
        <div v-for="group in filterGroups" :key="group.key" class="flex flex-wrap items-center gap-2" role="group" :aria-label="group.label">
          <span class="w-12 text-xs uppercase tracking-wide text-content-muted">{{ group.title }}</span>
          <AtomsChip
            v-for="option in group.options"
            :key="option.value"
            size="sm"
            :text="option.label"
            :count="option.count"
            :pressed="filters[group.key] === option.value"
            @click="choose(group.key, option.value)"
          />
        </div>
      </div>
      <p v-if="!days.length" class="text-sm text-content-muted">Nothing matches all of these. Try fewer filters.</p>
      <AdePlannerDayGroups :days="days" :heading-level="3" />
    </template>
  </section>
</template>

<script setup>
import { genreProfile, groupEventsByDay } from '~/composables/useAdePlanner.js'
import { track } from '~/utils/track'
import { withinBudget } from '../../../server/utils/ade-planner/price'
import { SIZES, VIBES } from '../../../server/utils/ade-planner/vibe'

const props = defineProps({
  // 'free', '25' or '50', picked in the planner's "On a budget" row.
  budget: { type: String, required: true }
})
defineEmits(['close'])

const HEADINGS = { free: 'Free parties', 25: 'Parties under €25', 50: 'Parties under €50' }
const heading = computed(() => HEADINGS[props.budget] ?? 'On a budget')
const showMore = ref(false)
const activeCount = computed(() => ['vibe', 'size', 'genre'].filter(key => filters[key]).length)

const isLoading = ref(true)
const error = ref('')
const events = ref([])
const filters = reactive({ vibe: '', size: '', genre: '' })

const matches = (event, skip) => withinBudget(event, props.budget)
  && (skip === 'vibe' || !filters.vibe || event.vibe === filters.vibe)
  && (skip === 'size' || !filters.size || event.size === filters.size)
  && (skip === 'genre' || !filters.genre || event.genres?.includes(filters.genre))

// Each group counts what you'd get when picking it, given the other filters.
const countFor = (key, test) => events.value.filter(event => matches(event, key) && test(event)).length

const filterGroups = computed(() => [
  { key: 'vibe', title: 'Vibe', label: 'Filter by vibe', options: VIBES.map(v => ({ ...v, count: countFor('vibe', e => e.vibe === v.value) })) },
  { key: 'size', title: 'Size', label: 'Filter by venue size', options: SIZES.map(s => ({ ...s, count: countFor('size', e => e.size === s.value) })) },
  {
    key: 'genre',
    title: 'Sound',
    label: 'Filter by genre',
    options: genreProfile(events.value.filter(event => matches(event, 'genre')).map(event => ({ event }))).slice(0, 8)
      .map(({ genre, count }) => ({ value: genre, label: genre, count }))
  },
])

const days = computed(() => groupEventsByDay(events.value.filter(event => matches(event)).map(event => ({ event, artists: [] }))))

function choose(key, value) {
  filters[key] = filters[key] === value ? '' : value
  // Counted in VAMS as e.g. ade-budget-filter:vibe-laid-back
  if (filters[key]) track('ade-budget-filter', { group: `${key}-${value}` })
}

onMounted(async () => {
  try {
    events.value = await $fetch('/api/ade-planner/budget')
    track('ade-budget-open', { events: events.value.length })
  } catch {
    error.value = 'Could not load cheap nights. Try again in a moment.'
  } finally {
    isLoading.value = false
  }
})
</script>
