<template>
  <div class="space-y-5">
    <form class="flex flex-col gap-3 sm:flex-row sm:items-end" @submit.prevent="load(); track('ade-daytime-search', { hasQuery: Boolean(q.trim()) })">
      <MoleculesFormField
        v-model="q"
        class="flex-1"
        label="Talks, meetups, workshops. Search by interest or name"
        name="ade-daytime-query"
        placeholder="labels, marketing, synths, Adam Beyer"
      />
      <AtomsButton type="submit" text="Search" :loading="isLoading" />
    </form>

    <div class="flex flex-wrap items-center gap-2" role="group" aria-label="What are you after?">
      <AtomsChip
        v-for="intent in intentOptions"
        :key="intent.value"
        size="sm"
        :text="INTENT_LABELS[intent.value]"
        :count="intent.count"
        :pressed="intents.includes(intent.value)"
        @click="toggleIntent(intent.value)"
      />
      <label class="ml-auto inline-flex items-center gap-2 text-sm text-content-muted">
        <input type="checkbox" class="accent-accent" :checked="hasProPass" @change="setProPass($event.target.checked)">
        I have an ADE Pro pass
      </label>
    </div>

    <MoleculesSegmentedTabs
      v-if="dayTabs.length"
      v-model="day"
      :items="dayTabs"
      label="Day"
      id-prefix="ade-day"
      :controls-panels="false"
    />

    <AdePlannerFiltersDrawer
      :filters="filters"
      :facets="result.facets"
      :active="activeFilters"
      @toggle="toggle"
      @clear="clearFilters"
    />

    <MoleculesStatusAlert :message="error" type="error" />

    <p v-if="result.partyArtists.length" class="text-sm text-content-muted">
      {{ partyArtistsText }}
      <button type="button" class="text-accent underline underline-offset-2" @click="$emit('show-parties', result.partyArtists.map(artist => artist.name))">
        See them in Parties &amp; concerts
      </button>
    </p>

    <p v-if="!isLoading && !result.total" class="text-sm text-content-muted">
      Nothing matches on this day. Try another day or fewer filters.
    </p>

    <section v-if="result.sessions.length" aria-labelledby="ade-sessions-heading" class="space-y-2">
      <AtomsHeading id="ade-sessions-heading" :text="`Sessions (${result.sessions.length})`" :level="2" size="md" class="uppercase tracking-wide" />
      <AdePlannerDayGroups :days="asDay(visibleSessions)" :show-day-headings="false" />
      <AtomsButton
        v-if="result.sessions.length > sessionLimit"
        variant="ghost"
        size="sm"
        :text="`Show ${result.sessions.length - sessionLimit} more`"
        @click="sessionLimit += 15"
      />
    </section>

    <details v-if="result.dropIns.length" class="space-y-2" open>
      <summary class="cursor-pointer text-sm font-bold uppercase tracking-wide text-content">
        Drop in any time ({{ result.dropIns.length }})
      </summary>
      <AdePlannerDayGroups class="mt-2" :days="asDay(result.dropIns)" :show-day-headings="false" />
    </details>

    <details v-if="result.tba.length" class="space-y-2">
      <summary class="cursor-pointer text-sm font-bold uppercase tracking-wide text-content-muted">
        ADE Pro, time not announced yet ({{ result.tba.length }})
      </summary>
      <AdePlannerDayGroups class="mt-2" :days="asDay(result.tba)" :show-day-headings="false" />
    </details>
  </div>
</template>

<script setup>
import { INTENT_LABELS, useDaytimeBrowse } from '~/composables/useDaytimeBrowse.js'
import { track } from '~/utils/track'

const props = defineProps({
  initialQuery: { type: String, default: '' }
})

defineEmits(['show-parties'])

const {
  q, day, hasProPass, intents, filters, result, isLoading, error, dayTabs, activeFilters,
  load, init, toggle, toggleIntent, clearFilters, setProPass
} = useDaytimeBrowse(props.initialQuery)

const partyArtistsText = computed(() => result.value.partyArtists
  .map(artist => `${artist.name} plays ${artist.parties} ${artist.parties === 1 ? 'party or concert' : 'parties or concerts'}`)
  .join('; ') + '.')

const sessionLimit = ref(15)
const visibleSessions = computed(() => result.value.sessions.slice(0, sessionLimit.value))

// Main intents only; "other" lives in the drawer's kinds.
const intentOptions = computed(() => (result.value.facets.intents ?? []).filter(option => option.value !== 'other'))

watch(day, () => { sessionLimit.value = 15 })

function asDay(events) {
  return [{ key: day.value || 'all', label: '', items: events.map(event => ({ event, artists: [] })) }]
}

watch(() => props.initialQuery, (query) => {
  if (query) {
    q.value = query
    load()
  }
})

onMounted(() => init())
</script>
