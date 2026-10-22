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

    <!-- Three ways in, one on screen at a time: say it, pick it, or match your music. -->
    <MoleculesSegmentedTabs
      :model-value="mode"
      :items="MODES"
      label="How do you want to search?"
      id-prefix="ade"
      @update:model-value="selectMode"
    />

    <div v-show="mode === 'ask'" id="ade-panel-ask" role="tabpanel" aria-labelledby="ade-tab-ask">
      <AdePlannerAskPanel @use-artists="useArtists" @show-schedule="selectMode('schedule')" />
    </div>

    <div v-if="visited.schedule" v-show="mode === 'schedule'" id="ade-panel-schedule" role="tabpanel" aria-labelledby="ade-tab-schedule" class="space-y-6">
      <AdePlannerSchedulePanel />
      <!-- The older daytime search (by speaker, label or topic), kept out of the way. -->
      <div class="border-t border-border-subtle pt-4">
        <AtomsButton
          variant="link-muted"
          :text="daytimeOpen ? 'Hide search by speaker or topic' : 'Search talks by speaker, label or topic'"
          :aria-expanded="daytimeOpen"
          aria-controls="ade-daytime-search"
          @click="daytimeOpen = !daytimeOpen"
        />
        <div v-if="daytimeOpen" id="ade-daytime-search" class="mt-4">
          <AdePlannerDaytimePanel :initial-query="daytimeQuery" @show-parties="useArtists" />
        </div>
      </div>
    </div>

    <!-- Always rendered: its intro and form are what search engines read for "ADE playlist". -->
    <div v-show="mode === 'artists'" id="ade-panel-artists" role="tabpanel" aria-labelledby="ade-tab-artists">
      <AdePlannerPartiesPanel :prefill="partiesPrefill" @show-daytime="showDaytime" />
    </div>
  </div>
</template>

<script setup>
import { useAdeFavorites } from '~/composables/useAdeFavorites.js'
import { track } from '~/utils/track'

const MODES = [
  { id: 'ask', label: 'Ask' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'artists', label: 'Your artists', shortLabel: 'Artists' }
]
// Old links: ?tab=daytime was the daytime search, now part of Schedule.
const LEGACY = { daytime: 'schedule', parties: 'artists' }

const route = useRoute()
const router = useRouter()
const { favorites } = useAdeFavorites()

const initial = MODES.some(item => item.id === route.query.mode) ? route.query.mode : LEGACY[route.query.tab] ?? 'ask'
const mode = ref(initial)
// Mount a mode on its first visit, then keep it (and its filters) alive.
const visited = reactive({ [initial]: true })
const daytimeOpen = ref(false)
const daytimeQuery = ref('')
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
  router.replace({ query: { ...route.query, tab: undefined, mode: id === 'ask' ? undefined : id } })
}

// From Ask (a link or artist names) or the daytime search: run them in Your artists.
function useArtists(input) {
  partiesPrefill.value = Array.isArray(input) ? input : String(input).split('\n')
  selectMode('artists')
}

function showDaytime(query) {
  daytimeQuery.value = query
  daytimeOpen.value = true
  selectMode('schedule')
}
</script>
