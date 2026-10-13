<template>
  <div class="space-y-5">
    <form class="flex flex-col gap-3 sm:flex-row sm:items-end" @submit.prevent="load({ log: true }); track('ade-daytime-search', { hasQuery: Boolean(q.trim()) })">
      <MoleculesFormField
        v-model="q"
        class="flex-1"
        label="Talks, interviews, Meet the… sessions, demos and more. Pick a topic or search"
        name="ade-daytime-query"
        placeholder="labels, AI, sync, Luciano"
      />
      <AtomsButton type="submit" text="Search" :loading="isLoading" />
    </form>

    <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Topics">
      <AtomsChip
        v-for="topic in visibleTopics"
        :key="topic.value"
        size="sm"
        :text="TOPIC_LABELS[topic.value] ?? topic.value"
        :count="topic.count"
        :pressed="filters.topics.includes(topic.value)"
        @click="toggle('topics', topic.value)"
      />
      <AtomsButton
        v-if="!showAllTopics && topicOptions.length > TOPICS_SHOWN"
        variant="link-muted"
        class="text-sm"
        :text="`${topicOptions.length - TOPICS_SHOWN} more`"
        @click="showAllTopics = true"
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

    <div v-if="result.sessions.length" class="flex flex-wrap items-center justify-between gap-3">
      <MoleculesSegmentedTabs v-model="view" :items="VIEWS" label="Show sessions as" id-prefix="ade-daytime-view" :controls-panels="false" />
      <span v-if="view === 'timetable'" class="text-xs text-content-muted">Each column is a venue; sessions at the same time get their own room.</span>
    </div>

    <AdePlannerTimetable v-if="view === 'timetable' && result.sessions.length" :columns="venueColumns" />

    <section v-for="group in (view === 'list' ? sessionGroups : [])" :key="group.id" :aria-labelledby="`ade-sessions-${group.id}`" class="space-y-2">
      <AtomsHeading :id="`ade-sessions-${group.id}`" :text="`${group.title} (${group.events.length})`" :level="2" size="md" class="uppercase tracking-wide" />
      <p v-if="group.hint" class="text-sm text-content-muted">{{ group.hint }}</p>
      <AdePlannerDayGroups :days="asDay(group.events.slice(0, limits[group.id]))" :show-day-headings="false" />
      <AtomsButton
        v-if="group.events.length > limits[group.id]"
        variant="ghost"
        size="sm"
        :text="`Show ${group.events.length - limits[group.id]} more`"
        @click="showMore(group)"
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
import { TOPIC_LABELS, useDaytimeBrowse } from '~/composables/useDaytimeBrowse.js'
import { layoutLanes, minutesOnDay } from '~/utils/timetable.js'
import { track } from '~/utils/track'
import { PROGRAM_LABELS, daytimeProgram } from '../../../server/utils/ade-planner/programs'

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

// ADE Pro and ADE Lab first: the conference is why you plan a day at ADE. They sit in
// different parts of town, so each gets its own section.
const sessionGroups = computed(() => [
  { id: 'pro', title: 'ADE Pro', hint: 'Talks, panels and networking, mostly in the city centre (Felix Meritis, Andaz, Rosewood).', events: result.value.sessions.filter(event => daytimeProgram(event) === 'pro') },
  { id: 'lab', title: 'ADE Lab', hint: 'Gear demos, listening sessions and hubs around Westergas in Westerpark.', events: result.value.sessions.filter(event => daytimeProgram(event) === 'lab') },
  { id: 'more', title: 'More by day', hint: 'Festival daytime events: showcases, record stores, art, wellbeing.', events: result.value.sessions.filter(event => daytimeProgram(event) === 'festival') }
].filter(group => group.events.length))

const LIMITS = { pro: 15, lab: 15, more: 10 }
const limits = reactive({ ...LIMITS })

function showMore(group) {
  limits[group.id] += 15
  track('ade-daytime-more', { section: group.id })
}

const VIEWS = [
  { id: 'timetable', label: 'Timetable' },
  { id: 'list', label: 'List' }
]
const view = ref('timetable')

// The day as a school timetable: one column per venue, ADE Pro venues first, then ADE
// Lab (Westerpark), then the busiest. Sessions only; drop-ins (all day, exhibitions) stay in the list below.
const VENUE_ORDER = { pro: 0, lab: 1, festival: 2 }
const venueRank = events => Math.min(...events.map(event => VENUE_ORDER[daytimeProgram(event)]))

const venueColumns = computed(() => {
  const byVenue = new Map()
  for (const event of result.value.sessions) {
    const key = event.venue || 'Elsewhere'
    byVenue.set(key, [...(byVenue.get(key) ?? []), event])
  }
  return [...byVenue.entries()]
    .sort(([, a], [, b]) => venueRank(a) - venueRank(b) || b.length - a.length)
    .map(([venue, events]) => {
      const { items, lanes } = layoutLanes(events.map(event => ({ event, ...minutesOnDay(event, 45) })))
      return {
        id: venue,
        label: venue,
        sublabel: [events[0].area, PROGRAM_LABELS[daytimeProgram(events[0])]].filter(Boolean).join(' · '),
        lanes,
        items: items.map(item => ({ ...item, meta: item.event.subtitle || '' }))
      }
    })
})

// Topics by how much is on that day (format, like talks or Meet the..., is in Filters).
const topicOptions = computed(() => result.value.facets.topics ?? [])

// A phone shows two rows of chips, not seven; a selected topic always stays visible.
const TOPICS_SHOWN = 7
const showAllTopics = ref(false)
const visibleTopics = computed(() => showAllTopics.value
  ? topicOptions.value
  : topicOptions.value.filter((topic, i) => i < TOPICS_SHOWN || filters.topics.includes(topic.value)))

watch(day, () => { Object.assign(limits, LIMITS) })

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
