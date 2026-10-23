<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-end gap-2">
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

    <ClientOnly>
      <AdePlannerSharedPlan v-if="sharedPlan" :plan="sharedPlan" @close="closeSharedPlan" />
    </ClientOnly>

    <ClientOnly>
      <AdePlannerMyPlan v-if="planOpen" id="ade-my-plan" />
    </ClientOnly>

    <ClientOnly>
      <AdePlannerMapView v-if="nearOpen" id="ade-map" @close="nearOpen = false" />
    </ClientOnly>

    <!-- Three ways in, one on screen at a time: match your music, say it, or pick it. -->
    <MoleculesSegmentedTabs
      :model-value="mode"
      :items="MODES"
      label="How do you want to search?"
      id-prefix="ade"
      @update:model-value="selectMode"
    />

    <!-- Always rendered: its intro and form are what search engines read for "ADE playlist". -->
    <div v-show="mode === 'artists'" id="ade-panel-artists" role="tabpanel" aria-labelledby="ade-tab-artists">
      <AdePlannerPartiesPanel :prefill="partiesPrefill" />
    </div>

    <div v-if="visited.left" v-show="mode === 'left'" id="ade-panel-left" role="tabpanel" aria-labelledby="ade-tab-left">
      <AdePlannerLeftPanel />
    </div>

    <div v-show="mode === 'ask'" id="ade-panel-ask" role="tabpanel" aria-labelledby="ade-tab-ask">
      <AdePlannerAskPanel @use-artists="useArtists" @show-schedule="selectMode('schedule')" />
    </div>

    <div v-if="visited.schedule" v-show="mode === 'schedule'" id="ade-panel-schedule" role="tabpanel" aria-labelledby="ade-tab-schedule" class="space-y-6">
      <AdePlannerSchedulePanel />
    </div>
  </div>
</template>

<script setup>
import { useAdeFavorites } from '~/composables/useAdeFavorites.js'
import { track } from '~/utils/track'
import { adeSpotlightOn } from '~/utils/adeSpotlight'

// Your artists is what the planner is for; in the last ADE days "What's left" opens first.
const LEFT_FIRST = adeSpotlightOn()
const MODES = [
  ...(LEFT_FIRST ? [{ id: 'left', label: "What's left", shortLabel: 'Left' }] : []),
  { id: 'artists', label: 'Your artists', shortLabel: 'Artists' },
  { id: 'ask', label: 'Ask' },
  { id: 'schedule', label: 'Schedule' }
]
// Old links: ?tab=daytime was the daytime search (dropped 23 Oct).
const LEGACY = { daytime: LEFT_FIRST ? 'left' : 'schedule', parties: 'artists' }

const route = useRoute()
const router = useRouter()
const { favorites } = useAdeFavorites()

const initial = MODES.some(item => item.id === route.query.mode) ? route.query.mode : LEGACY[route.query.tab] ?? MODES[0].id
const mode = ref(initial)
// Mount a mode on its first visit, then keep it (and its filters) alive.
const visited = reactive({ [initial]: true })
const planOpen = ref(false)
const partiesPrefill = ref([])
const nearOpen = ref(false)
// A friend's plan from a shared link (?plan=...), shown above everything else.
const sharedPlan = computed(() => (typeof route.query.plan === 'string' ? route.query.plan : ''))

function closeSharedPlan() {
  router.replace({ query: { ...route.query, plan: undefined } })
}

function selectMode(id) {
  if (mode.value !== id) track('ade-mode', { tab: id })
  mode.value = id
  visited[id] = true
  router.replace({ query: { ...route.query, tab: undefined, mode: id === MODES[0].id ? undefined : id } })
}

// From Ask (a link or artist names) or the daytime search: run them in Your artists.
function useArtists(input) {
  partiesPrefill.value = Array.isArray(input) ? input : String(input).split('\n')
  selectMode('artists')
}

</script>
