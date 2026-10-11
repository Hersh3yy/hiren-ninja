<template>
  <section class="space-y-4 rounded-xl border border-accent-muted p-4" aria-labelledby="ade-my-plan-heading">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <AtomsHeading
        id="ade-my-plan-heading"
        :text="`My plan (${favorites.length})`"
        :level="2"
        size="xl"
        class="uppercase tracking-wide"
      />
      <MoleculesSegmentedTabs
        v-if="favorites.length"
        v-model="view"
        :items="VIEWS"
        label="Show my plan as"
        id-prefix="ade-plan-view"
        :controls-panels="false"
      />
    </div>

    <p class="text-sm text-content-muted">
      {{ favorites.length ? 'Saved in this browser only.' : 'Open an event and tap "Save to my plan" (or the ☆) to build your week.' }}
    </p>

    <MoleculesStatusAlert v-if="clashText" :message="clashText" type="error" />

    <template v-if="favorites.length">
      <AdePlannerTimetable v-if="view === 'timetable'" :columns="weekColumns" :px-per-minute="0.9" :lane-width="128" :mark-saved="false" />
      <AdePlannerDayGroups v-else :days="days" />

      <div class="flex flex-wrap items-center gap-2">
        <AtomsButton size="sm" variant="outline" text="Add to calendar (.ics)" @click="downloadCalendar" />
      </div>
    </template>
  </section>
</template>

<script setup>
import { useAdeFavorites } from '~/composables/useAdeFavorites.js'
import { groupEventsByDay } from '~/composables/useAdePlanner.js'
import { findClashes, layoutLanes, minutesOnDay, planningDay, toIcs } from '~/utils/timetable.js'
import { track } from '~/utils/track'

const VIEWS = [
  { id: 'timetable', label: 'Timetable' },
  { id: 'list', label: 'List' }
]
const ADE_DAYS = ['2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25']
const dayName = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', timeZone: 'UTC' })

const { favorites } = useAdeFavorites()
const view = ref('timetable')

const days = computed(() => groupEventsByDay(
  favorites.value.map(({ artists, ...event }) => ({ event, artists: artists ?? [] }))
))

// One column per ADE day, like a school week; overlapping events get their own lane.
const placed = computed(() => favorites.value.map(({ artists, ...event }) => ({
  event, artists: artists ?? [], day: planningDay(event), ...minutesOnDay(event)
})))

const clashes = computed(() => ADE_DAYS.flatMap(day => findClashes(placed.value.filter(item => item.day === day))))
const clashIds = computed(() => new Set(clashes.value.flatMap(pair => pair.map(item => item.event.id))))

const weekColumns = computed(() => {
  const extraDays = [...new Set(placed.value.map(item => item.day))].filter(day => !ADE_DAYS.includes(day))
  return [...ADE_DAYS, ...extraDays.sort()].map((day) => {
    const { items, lanes } = layoutLanes(placed.value.filter(item => item.day === day))
    return {
      id: day,
      label: dayName.format(new Date(`${day}T12:00:00Z`)),
      sublabel: items.length ? `${items.length} saved` : 'Free day',
      lanes,
      items: items.map(item => ({ ...item, clash: clashIds.value.has(item.event.id) }))
    }
  })
})

const clashText = computed(() => {
  if (!clashes.value.length) return ''
  const [first, second] = clashes.value[0]
  const more = clashes.value.length > 1 ? ` (and ${clashes.value.length - 1} more)` : ''
  return `You can't be in two places: "${first.event.title}" and "${second.event.title}" overlap${more}.`
})

function downloadCalendar() {
  const blob = new Blob([toIcs(favorites.value)], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'my-ade-2026.ics'
  link.click()
  setTimeout(() => URL.revokeObjectURL(link.href), 1000)
  track('ade-calendar', { saved: favorites.value.length })
}
</script>
