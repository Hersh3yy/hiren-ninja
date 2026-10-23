<template>
  <section class="space-y-4" aria-label="What's left">
    <p class="text-sm text-content-muted">
      The parties you can still get into, most wanted first: what planner users starred, clicked and have in their playlists.
    </p>

    <div class="space-y-3">
      <MoleculesChipGroup :model-value="day" label="Day" :options="days" @update:model-value="pickDay" />
      <MoleculesChipGroup :model-value="budget" label="Price" :options="budgetOptions" @update:model-value="pickBudget" />
    </div>

    <MoleculesStatusAlert :message="error" type="error" />
    <AtomsLoader v-if="isLoading && !result" type="dots" size="md" color="accent" text="Finding what's left" />

    <div v-if="result" class="space-y-3" :aria-busy="isLoading">
      <p class="border-t border-border-subtle pt-4 text-sm">
        <span class="font-bold text-accent">{{ result.total }} {{ result.total === 1 ? 'party' : 'parties' }} with tickets</span>
        <span class="text-content-muted"> · {{ dayLabel }}{{ budget ? ` · ${budgetLabel}` : '' }}</span>
      </p>
      <p v-if="!result.events.length" class="text-sm text-content-muted">Nothing left at this price. Try a higher one.</p>
      <AdePlannerDayGroups v-else :days="listDays" :show-day-headings="false" />
      <AtomsButton v-if="shown < result.events.length" variant="ghost" size="sm" :text="`Show ${Math.min(10, result.events.length - shown)} more`" @click="shown += 10" />
      <p v-else-if="result.total > result.events.length" class="text-xs text-content-muted">
        Top {{ result.events.length }} of {{ result.total }}. Pick a lower price to see the cheaper ones.
      </p>
    </div>
  </section>
</template>

<script setup>
import { dayOptions } from '~/composables/useAdeAsk.js'
import { track } from '~/utils/track'
import { priceNote } from '../../../server/utils/ade-planner/highlights'

const BUDGETS = [
  { value: '', key: 'any', label: 'Tickets left' },
  { value: '50', key: '50', label: 'Under €50' },
  { value: '25', key: '25', label: 'Under €25' },
  { value: 'free', key: 'free', label: 'Free' },
]

const days = ref([])
const day = ref('')
const budget = ref('')
const result = ref(null)
const isLoading = ref(false)
const error = ref('')
const shown = ref(15)

const budgetOptions = computed(() => BUDGETS.map(option => ({
  value: option.value || 'any',
  label: result.value ? `${option.label} ${result.value.counts[option.key] ?? 0}` : option.label,
})))
const budgetLabel = computed(() => BUDGETS.find(option => option.value === budget.value)?.label ?? '')
const dayLabel = computed(() => days.value.find(option => option.value === day.value)?.label ?? '')

const listDays = computed(() => [{
  key: 'left',
  label: '',
  items: result.value.events.slice(0, shown.value).map(event => ({ event, artists: [], note: priceNote(event) }))
}])

async function load() {
  if (!day.value) return
  isLoading.value = true
  error.value = ''
  try {
    result.value = await $fetch('/api/ade-planner/left', { query: { day: day.value, budget: budget.value } })
    shown.value = 15
  } catch {
    error.value = "Could not load what's left. Try again in a moment."
  } finally {
    isLoading.value = false
  }
}

function pickDay(value) {
  // There is always a day; tapping the picked one again keeps it.
  day.value = value || day.value
  track('ade-left-filter', { group: `day-${days.value.findIndex(option => option.value === day.value)}` })
  load()
}

function pickBudget(value) {
  // "Tickets left" is the chip for no price limit; tapping a price again goes back to it.
  budget.value = value === 'any' || value === budget.value ? '' : value
  track('ade-left-filter', { group: `budget-${budget.value || 'any'}` })
  load()
}

// Today and the days after it; the "All days" option of Schedule makes no sense here.
onMounted(() => {
  days.value = dayOptions().filter(option => option.value !== 'all')
  day.value = days.value[0]?.value ?? ''
  track('ade-left-open', { result: day.value })
  load()
})
</script>
