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

      <ClientOnly>
        <AtomsChip
          :text="`★ My plan (${favorites.length})`"
          :pressed="planOpen"
          :aria-expanded="planOpen"
          aria-controls="ade-my-plan"
          @click="planOpen = !planOpen"
        />
        <template #fallback>
          <AtomsChip text="★ My plan" />
        </template>
      </ClientOnly>
    </div>

    <ClientOnly>
      <AdePlannerMyPlan v-if="planOpen" id="ade-my-plan" />
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

function selectTab(id) {
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
