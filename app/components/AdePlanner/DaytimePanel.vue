<template>
  <div class="space-y-5">
    <form class="flex flex-col gap-3 sm:flex-row sm:items-end" @submit.prevent="load({ log: true }); track('ade-daytime-search', { hasQuery: Boolean(q.trim()) })">
      <MoleculesFormField
        v-model="q"
        class="flex-1"
        label="ADE Pro talks, interviews, Meet the… sessions and demos. Search by topic or name"
        name="ade-daytime-query"
        placeholder="labels, AI, sync, Luciano"
      />
      <AtomsButton type="submit" text="Search" :loading="isLoading" />
    </form>

    <div class="flex flex-wrap items-center gap-2" role="group" aria-label="What kind of session?">
      <AtomsChip
        v-for="kind in visibleKinds"
        :key="kind.value"
        size="sm"
        :text="KIND_LABELS[kind.value] ?? kind.value"
        :count="kind.count"
        :pressed="filters.kinds.includes(kind.value)"
        @click="toggle('kinds', kind.value)"
      />
      <AtomsButton
        v-if="!showAllKinds && kindOptions.length > KINDS_SHOWN"
        variant="link-muted"
        class="text-sm"
        :text="`${kindOptions.length - KINDS_SHOWN} more`"
        @click="showAllKinds = true"
      />
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
      <AtomsButton variant="link" text="See them in Parties & concerts" @click="$emit('show-parties', result.partyArtists.map(artist => artist.name))" />
    </p>

    <p v-if="result.partyGenres.length" class="text-sm text-content-muted">
      {{ partyGenresText }}
      <AtomsButton variant="link" text="Find yours in Parties & concerts" @click="$emit('show-parties', [])" />
    </p>

    <p v-if="result.didYouMean.length" class="text-sm text-content-muted">
      Did you mean
      <template v-for="(word, i) in result.didYouMean" :key="word">
        <AtomsButton variant="link" :text="word" @click="searchFor(word)" />{{ i < result.didYouMean.length - 1 ? ' or ' : '' }}
      </template>?
    </p>

    <p v-if="!isLoading && !result.total && !result.partyGenres.length && !result.didYouMean.length" class="text-sm text-content-muted">
      {{ q.trim() ? `Nothing for "${q.trim()}" during the day. Try a topic like AI, labels or sync, or a speaker's name.` : 'Nothing matches on this day. Try another day or fewer filters.' }}
    </p>

    <section v-for="group in sessionGroups" :key="group.id" :aria-labelledby="`ade-sessions-${group.id}`" class="space-y-2">
      <AtomsHeading :id="`ade-sessions-${group.id}`" :text="`${group.title} (${group.events.length})`" :level="2" size="md" class="uppercase tracking-wide" />
      <p v-if="group.hint" class="text-sm text-content-muted">{{ group.hint }}</p>
      <AdePlannerDayGroups :days="asDay(group.events.slice(0, limits[group.id]))" :show-day-headings="false" />
      <AtomsButton
        v-if="group.events.length > limits[group.id]"
        variant="ghost"
        size="sm"
        :text="`Show ${group.events.length - limits[group.id]} more`"
        @click="limits[group.id] += 15"
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
        Time not announced yet ({{ result.tba.length }})
      </summary>
      <AdePlannerDayGroups class="mt-2" :days="asDay(result.tba)" :show-day-headings="false" />
    </details>
  </div>
</template>

<script setup>
import { KIND_LABELS, useDaytimeBrowse } from '~/composables/useDaytimeBrowse.js'
import { track } from '~/utils/track'

const props = defineProps({
  initialQuery: { type: String, default: '' }
})

defineEmits(['show-parties'])

const {
  q, day, filters, result, isLoading, error, dayTabs, activeFilters,
  load, init, toggle, clearFilters
} = useDaytimeBrowse(props.initialQuery)

const partyGenresText = computed(() => result.value.partyGenres
  .map(({ genre, parties }) => `${genre} is a night thing at ADE: ${parties} parties, no daytime sessions.`)
  .join(' '))

function searchFor(word) {
  q.value = word
  load({ log: true })
  track('ade-daytime-search', { hasQuery: true, didYouMean: true })
}

const partyArtistsText = computed(() => result.value.partyArtists
  .map(artist => `${artist.name} plays ${artist.parties} ${artist.parties === 1 ? 'party or concert' : 'parties or concerts'}`)
  .join('; ') + '.')

// ADE Pro (and ADE Lab) first: the conference is why you plan a day at ADE.
const sessionGroups = computed(() => [
  { id: 'pro', title: 'ADE Pro & Lab', hint: '', events: result.value.sessions.filter(event => event.program === 'pro') },
  { id: 'more', title: 'More by day', hint: 'Festival daytime events: showcases, record stores, art, wellbeing.', events: result.value.sessions.filter(event => event.program !== 'pro') }
].filter(group => group.events.length))

const limits = reactive({ pro: 15, more: 10 })

// Pro formats first (the reason to come by day), then the rest by how much is on.
const PRO_FIRST = ['talks', 'interviews', 'meet-the', 'masterclasses', 'gear']
const kindOptions = computed(() => {
  const options = result.value.facets.kinds ?? []
  const rank = kind => (PRO_FIRST.includes(kind) ? PRO_FIRST.indexOf(kind) : PRO_FIRST.length)
  return [...options].sort((a, b) => rank(a.value) - rank(b.value) || b.count - a.count)
})

// A phone shows two rows of chips, not seven; a selected kind always stays visible.
const KINDS_SHOWN = 6
const showAllKinds = ref(false)
const visibleKinds = computed(() => showAllKinds.value
  ? kindOptions.value
  : kindOptions.value.filter((kind, i) => i < KINDS_SHOWN || filters.kinds.includes(kind.value)))

watch(day, () => { Object.assign(limits, { pro: 15, more: 10 }) })

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
