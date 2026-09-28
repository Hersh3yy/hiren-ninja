<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div role="tablist" aria-label="ADE Planner" class="inline-flex rounded-full border border-border-default p-1">
        <button
          v-for="t in TABS"
          :id="`ade-tab-${t.id}`"
          :key="t.id"
          type="button"
          role="tab"
          :aria-selected="tab === t.id"
          :aria-controls="`ade-panel-${t.id}`"
          class="rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          :class="tab === t.id ? 'bg-accent text-ink' : 'text-content-muted hover:text-content'"
          @click="selectTab(t.id)"
        >
          {{ t.label }}
        </button>
      </div>

      <button
        type="button"
        :aria-expanded="planOpen"
        aria-controls="ade-my-plan"
        class="rounded-full border px-4 py-1.5 text-sm font-bold uppercase tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        :class="planOpen ? 'border-accent text-accent' : 'border-border-default text-content hover:border-accent-muted'"
        @click="planOpen = !planOpen"
      >
        ★ My plan<ClientOnly> ({{ favorites.length }})</ClientOnly>
      </button>
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
      <AdePlannerPartiesPanel @show-daytime="showDaytime" />
    </div>

    <div
      v-if="daytimeVisited"
      v-show="tab === 'daytime'"
      id="ade-panel-daytime"
      role="tabpanel"
      aria-labelledby="ade-tab-daytime"
    >
      <AdePlannerDaytimePanel :initial-query="daytimeQuery" />
    </div>
  </div>
</template>

<script setup>
import { useAdeFavorites } from '~/composables/useAdeFavorites.js'

const TABS = [
  { id: 'parties', label: 'Parties & concerts' },
  { id: 'daytime', label: 'Daytime & networking' }
]

const route = useRoute()
const router = useRouter()
const { favorites } = useAdeFavorites()

const tab = ref(route.query.tab === 'daytime' ? 'daytime' : 'parties')
// Mount the daytime panel on first visit, then keep it (and its filters) alive.
const daytimeVisited = ref(tab.value === 'daytime')
const daytimeQuery = ref('')
const planOpen = ref(false)

function selectTab(id) {
  tab.value = id
  if (id === 'daytime') daytimeVisited.value = true
  router.replace({ query: { ...route.query, tab: id === 'parties' ? undefined : id } })
}

function showDaytime(query) {
  daytimeQuery.value = query
  selectTab('daytime')
}
</script>
