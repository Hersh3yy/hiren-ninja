<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <MoleculesSegmentedTabs
        :model-value="tab"
        :items="TABS"
        label="ADE Planner"
        id-prefix="ade"
        @update:model-value="selectTab"
      />

      <div class="flex flex-wrap items-center gap-2">
        <ClientOnly>
          <AtomsChip
            :text="`★ My plan (${favorites.length})`"
            :pressed="planOpen"
            :aria-expanded="planOpen"
            aria-controls="ade-my-plan"
            @click="planOpen = !planOpen; planOpen && track('ade-plan-open', { saved: favorites.length })"
          />
          <template #fallback>
            <AtomsChip text="★ My plan" />
          </template>
        </ClientOnly>
        <AtomsChip
          text="Map"
          :pressed="nearOpen"
          :aria-expanded="nearOpen"
          aria-controls="ade-map"
          @click="nearOpen = !nearOpen"
        />
      </div>
    </div>

    <!-- Type what you want or pick filters: the quickest way in, no playlist needed. -->
    <AdePlannerAskPanel />

    <!-- Casual visitors: straight to free or cheap nights, no playlist needed. -->
    <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Parties by ticket price">
      <span class="text-xs font-bold uppercase tracking-wide text-content-muted">On a budget</span>
      <AtomsChip
        v-for="option in BUDGETS"
        :key="option.value"
        size="sm"
        :text="option.label"
        :pressed="budget === option.value"
        :aria-expanded="budget === option.value"
        aria-controls="ade-budget-parties"
        @click="chooseBudget(option.value)"
      />
    </div>

    <ClientOnly>
      <AdePlannerSharedPlan v-if="sharedPlan" :plan="sharedPlan" @close="closeSharedPlan" />
    </ClientOnly>

    <ClientOnly>
      <AdePlannerMyPlan v-if="planOpen" id="ade-my-plan" />
    </ClientOnly>

    <ClientOnly>
      <AdePlannerBudgetParties v-if="budget" id="ade-budget-parties" :budget="budget" @close="budget = ''" />
    </ClientOnly>

    <ClientOnly>
      <AdePlannerMapView v-if="nearOpen" id="ade-map" @close="nearOpen = false" />
    </ClientOnly>

    <div
      v-show="tab === 'parties'"
      id="ade-panel-parties"
      role="tabpanel"
      aria-labelledby="ade-tab-parties"
    >
      <AdePlannerPartiesPanel :prefill="partiesPrefill" @show-daytime="showDaytime" />
    </div>

    <div
      v-if="daytimeVisited"
      v-show="tab === 'daytime'"
      id="ade-panel-daytime"
      role="tabpanel"
      aria-labelledby="ade-tab-daytime"
    >
      <AdePlannerDaytimePanel :initial-query="daytimeQuery" @show-parties="showParties" />
    </div>
  </div>
</template>

<script setup>
import { useAdeFavorites } from '~/composables/useAdeFavorites.js'
import { track } from '~/utils/track'
import { BUDGETS } from '../../../server/utils/ade-planner/price'

const TABS = [
  { id: 'parties', label: 'Parties & concerts', shortLabel: 'Parties' },
  { id: 'daytime', label: 'Daytime & networking', shortLabel: 'Daytime' }
]

const route = useRoute()
const router = useRouter()
const { favorites } = useAdeFavorites()

const tab = ref(route.query.tab === 'daytime' ? 'daytime' : 'parties')
// Mount the daytime panel on first visit, then keep it (and its filters) alive.
const daytimeVisited = ref(tab.value === 'daytime')
const daytimeQuery = ref('')
const planOpen = ref(false)
const partiesPrefill = ref([])
const nearOpen = ref(false)
// '' (closed), 'free', '25' or '50': which budget list is open.
const budget = ref('')

function chooseBudget(value) {
  budget.value = budget.value === value ? '' : value
  if (budget.value) track('ade-budget', { budget: budget.value, result: 'top' })
}
// A friend's plan from a shared link (?plan=...), shown above everything else.
const sharedPlan = computed(() => (typeof route.query.plan === 'string' ? route.query.plan : ''))

function closeSharedPlan() {
  router.replace({ query: { ...route.query, plan: undefined } })
}

function selectTab(id) {
  if (tab.value !== id) track('ade-tab', { tab: id })
  tab.value = id
  if (id === 'daytime') daytimeVisited.value = true
  router.replace({ query: { ...route.query, tab: id === 'parties' ? undefined : id } })
}

function showParties(names) {
  partiesPrefill.value = names
  selectTab('parties')
}

function showDaytime(query) {
  daytimeQuery.value = query
  selectTab('daytime')
}
</script>
