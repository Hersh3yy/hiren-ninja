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
      <AdePlannerPlanMap v-else-if="view === 'map'" :stops="mapStops" :missing="favorites.length - mapStops.length" />
      <AdePlannerDayGroups v-else :days="days" />

      <div v-if="trips.length" class="space-y-1">
        <AtomsHeading text="Getting around" :level="3" size="sm" class="uppercase tracking-wide" />
        <ul class="space-y-1 text-sm text-content-muted">
          <li v-for="trip in trips" :key="trip.id" :class="trip.tight ? 'text-danger' : ''">
            <span class="font-mono text-xs">{{ trip.day }}</span>
            {{ trip.from }} → {{ trip.to }}: {{ trip.text }}{{ trip.tight ? `, but only ${trip.gap} min between them` : '' }}
          </li>
        </ul>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <AtomsButton size="sm" variant="outline" text="Add to calendar (.ics)" @click="downloadCalendar" />
        <AtomsButton size="sm" variant="outline" text="Share as story image" @click="shareStory" />
        <AtomsButton size="sm" variant="outline" text="Share a link to my plan" @click="sharePlanLink" />
        <span v-if="linkText" class="text-sm text-success" role="status">{{ linkText }}</span>
      </div>
    </template>
  </section>
</template>

<script setup>
import { useAdeFavorites } from '~/composables/useAdeFavorites.js'
import { groupEventsByDay } from '~/composables/useAdePlanner.js'
import { findClashes, formatMinutes, layoutLanes, minutesOnDay, planningDay, toIcs } from '~/utils/timetable.js'
import { track } from '~/utils/track'
import { drawPlanStory, shareCanvas } from '~/utils/storyImage.js'
import { describeTrip, travel } from '../../../server/utils/ade-planner/travel'
import { encodePlan } from '../../../server/utils/ade-planner/plan-link'

const VIEWS = [
  { id: 'timetable', label: 'Timetable' },
  { id: 'list', label: 'List' },
  { id: 'map', label: 'Map' }
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

// Map pins: saved events with a known place, numbered in order per day.
const mapStops = computed(() => ADE_DAYS.flatMap((day) => {
  const items = placed.value.filter(item => item.day === day && item.event.place).sort((a, b) => a.from - b.from)
  return items.map((item, i) => ({
    id: item.event.id,
    lat: item.event.place.lat,
    lng: item.event.place.lng,
    day,
    dayLabel: dayName.format(new Date(`${day}T12:00:00Z`)),
    order: i + 1,
    title: item.event.title,
    time: formatMinutes(item.from)
  }))
}))

// From one saved event to the next on the same day: how long it takes, and whether
// the gap between them is long enough. Needs both venues' places (VAMS ade-venue).
const trips = computed(() => ADE_DAYS.flatMap((day) => {
  const items = placed.value.filter(item => item.day === day).sort((a, b) => a.from - b.from)
  return items.slice(1).flatMap((next, i) => {
    const prev = items[i]
    if (!prev.event.place || !next.event.place || prev.event.venue === next.event.venue) return []
    const trip = travel(prev.event.place, next.event.place)
    const gap = next.from - prev.to
    return [{
      id: `${prev.event.id}-${next.event.id}`,
      day: dayName.format(new Date(`${day}T12:00:00Z`)),
      from: prev.event.venue,
      to: next.event.venue,
      text: describeTrip(trip),
      gap,
      tight: gap >= 0 && gap < trip.minutes
    }]
  })
}))

const clashText = computed(() => {
  if (!clashes.value.length) return ''
  const [first, second] = clashes.value[0]
  const more = clashes.value.length > 1 ? ` (and ${clashes.value.length - 1} more)` : ''
  return `You can't be in two places: "${first.event.title}" and "${second.event.title}" overlap${more}.`
})

// A 9:16 picture of the week for an Instagram or WhatsApp story.
async function shareStory() {
  const canvas = document.createElement('canvas')
  drawPlanStory(canvas, weekColumns.value.filter(column => ADE_DAYS.includes(column.id)).map(column => ({
    label: column.label,
    items: [...column.items].sort((a, b) => a.from - b.from).map(item => ({
      time: formatMinutes(item.from), title: item.event.title, venue: item.event.venue, party: item.event.isParty !== false
    }))
  })))
  const result = await shareCanvas(canvas, 'my-ade-2026.png')
  track('ade-story-image', { result, saved: favorites.value.length })
}

// The plan travels in the link itself: no account, nothing stored on the server.
const linkText = ref('')

async function sharePlanLink() {
  const url = `${window.location.origin}/ade-planner?plan=${encodePlan(favorites.value.map(favorite => favorite.id))}`
  let result = 'copied'
  // Phones get the share sheet (WhatsApp, Messages); computers copy the link.
  const touch = window.matchMedia?.('(pointer: coarse)').matches
  if (touch && navigator.share) {
    try {
      await navigator.share({ url, title: 'My ADE 2026 plan' })
      result = 'shared'
    } catch {
      result = 'cancelled'
    }
  } else {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // No clipboard access (insecure context, permissions): show the link to copy by hand.
      window.prompt('Copy this link to your plan:', url)
    }
  }
  linkText.value = result === 'copied' ? 'Link copied. Anyone with it sees your plan.' : ''
  if (linkText.value) setTimeout(() => { linkText.value = '' }, 5000)
  track('ade-share-plan-link', { result, saved: favorites.value.length })
}

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
