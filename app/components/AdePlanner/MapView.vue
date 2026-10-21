<template>
  <section class="space-y-4 rounded-xl border border-accent-muted p-4" aria-labelledby="ade-map-heading">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <AtomsHeading id="ade-map-heading" text="Map" :level="2" size="xl" class="uppercase tracking-wide" />
      <AtomsButton variant="ghost" size="sm" text="Close" @click="$emit('close')" />
    </div>

    <div class="space-y-3">
      <div class="flex flex-wrap items-center gap-2" role="group" aria-label="When">
        <span class="w-14 text-xs uppercase tracking-wide text-content-muted">When</span>
        <AtomsChip v-for="option in WINDOWS" :key="option.value" size="sm" :text="option.label" :pressed="when === option.value" @click="when = option.value" />
      </div>
      <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Distance from you">
        <span class="w-14 text-xs uppercase tracking-wide text-content-muted">Within</span>
        <AtomsChip v-for="option in RADII" :key="option.value" size="sm" :text="option.label" :pressed="radius === option.value" @click="radius = option.value" />
        <AtomsButton v-if="!here" size="sm" variant="outline" text="Use my location" :loading="locating" @click="locate" />
      </div>
      <p class="text-xs text-content-muted">
        {{ here ? (here.preview ? 'Preview from Centraal Station.' : 'Around you.') : 'Share your location to see what is close; until then the map centres on Centraal Station.' }}
        {{ !duringAde ? `ADE runs 21–25 October; showing ${previewLabel}.` : '' }}
        Your location stays on your phone.
      </p>
      <MoleculesStatusAlert :message="error" type="error" />
    </div>

    <div ref="mapEl" class="h-[360px] w-full overflow-hidden rounded-lg border border-border-subtle bg-ink sm:h-[460px]" role="region" aria-label="Map of ADE events" />
    <p class="text-xs text-content-muted">
      <span class="inline-block size-2.5 rounded-full bg-accent align-middle" /> parties ·
      <span class="inline-block size-2.5 rounded-full align-middle" style="background:#6c9cf0" /> daytime ·
      {{ shown.length }} {{ shown.length === 1 ? 'event' : 'events' }}{{ radius ? ` within ${radius} km` : '' }}
    </p>

    <AtomsLoader v-if="loading" type="spinner" size="md" color="accent" text="Loading the map" />
    <p v-else-if="!shown.length" class="text-sm text-content-muted">Nothing on {{ radius ? `within ${radius} km` : '' }} {{ windowLabel.toLowerCase() }}. Try a bigger distance.</p>
    <AdePlannerDayGroups v-else :days="listDays" :show-day-headings="false" />
  </section>
</template>

<script setup>
// Every event on a map, filtered by time and by distance from you (2 km by default).
// Leaflet loads only when the map opens. Distances are worked out here, in the
// browser: the location is never sent anywhere.
import { describeTrip, distanceKm, travel } from '../../../server/utils/ade-planner/travel'
import { track } from '~/utils/track'

defineEmits(['close'])

const CENTRAAL = { lat: 52.3791, lng: 4.9003, preview: true }
const ADE_START = new Date('2026-10-21T00:00:00+02:00')
const ADE_END = new Date('2026-10-26T08:00:00+01:00')
const HOUR = 3_600_000
const now = new Date()
const duringAde = now >= ADE_START && now < ADE_END
// Outside ADE week: show Friday night, so the map is never empty.
const base = duringAde ? now : new Date('2026-10-23T21:00:00+02:00')
const previewLabel = 'Friday 23 October from 21:00'

const WINDOWS = [
  { value: 'soon', label: 'On now & next 3h' },
  { value: 'tonight', label: 'Tonight' },
  { value: 'today', label: 'Today' },
]
const RADII = [
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 0, label: 'Anywhere' },
]

const when = ref('soon')
const radius = ref(2)
const here = ref(null)
const locating = ref(false)
const loading = ref(false)
const error = ref('')
const events = ref([])
const mapEl = ref(null)

const amsterdamDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit' })
const amsterdamHour = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', hourCycle: 'h23' })

/** [from, to] for the chosen window, in Amsterdam time; nights run to 06:00. */
function windowFor(value) {
  // Before 06:00 it's still last night.
  const night = Number(amsterdamHour.format(base)) < 6 ? new Date(base.getTime() - 6 * HOUR) : base
  const day = amsterdamDay.format(night)
  const offset = new Date(`${day}T12:00:00Z`).toLocaleString('en-US', { timeZone: 'Europe/Amsterdam', timeZoneName: 'shortOffset' }).includes('GMT+1') ? '+01:00' : '+02:00'
  const at = hours => new Date(`${day}T00:00:00${offset}`).getTime() + hours * HOUR
  if (value === 'soon') return [base.getTime() - 15 * 60_000, base.getTime() + 3 * HOUR]
  if (value === 'tonight') return [Math.max(at(18), base.getTime() - 15 * 60_000), at(30)]
  return [Math.max(at(6), base.getTime() - 15 * 60_000), at(30)]
}
const windowLabel = computed(() => WINDOWS.find(option => option.value === when.value)?.label ?? '')

const centre = computed(() => here.value ?? CENTRAAL)
const withDistance = computed(() => events.value
  .map(event => ({ event, km: distanceKm(centre.value, event.place), trip: travel(centre.value, event.place) }))
  .sort((a, b) => a.km - b.km || a.event.startsAt.localeCompare(b.event.startsAt)))
const shown = computed(() => withDistance.value.filter(item => !radius.value || item.km <= radius.value))

const clock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit' })
const listDays = computed(() => [{
  key: 'map',
  label: '',
  items: shown.value.slice(0, 60).map(({ event, trip }) => ({ event, artists: [], note: describeTrip(trip) }))
}])

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [from, to] = windowFor(when.value)
    events.value = await $fetch('/api/ade-planner/map', { query: { from: new Date(from).toISOString(), to: new Date(to).toISOString() } })
  } catch {
    error.value = 'Could not load the map. Try again in a moment.'
  } finally {
    loading.value = false
  }
}

function locate() {
  if (!navigator.geolocation) {
    error.value = 'Your browser has no location.'
    return
  }
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (result) => {
      here.value = { lat: result.coords.latitude, lng: result.coords.longitude }
      locating.value = false
      track('ade-map-locate', { result: 'shared' })
    },
    () => {
      error.value = 'Location was not shared. Allow it for this site, or use the map from Centraal Station.'
      locating.value = false
      track('ade-map-locate', { result: 'denied' })
    },
    { enableHighAccuracy: false, timeout: 10_000, maximumAge: 120_000 }
  )
}

let L = null
let map = null
let layer = null

async function draw() {
  if (!mapEl.value) return
  if (!L) {
    L = (await import('leaflet')).default
    await import('leaflet/dist/leaflet.css')
  }
  if (!map) {
    map = L.map(mapEl.value, { scrollWheelZoom: false })
    // OpenStreetMap's own tiles (no key), darkened with a CSS filter to match the site.
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      className: 'ade-map-tiles'
    }).addTo(map)
  }
  layer?.remove()
  layer = L.layerGroup().addTo(map)

  // One marker per venue, listing what's on there.
  const byVenue = new Map()
  for (const item of shown.value) {
    const key = `${item.event.place.lat},${item.event.place.lng}`
    byVenue.set(key, [...(byVenue.get(key) ?? []), item.event])
  }
  const escape = text => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  for (const venueEvents of byVenue.values()) {
    const { place, venue } = venueEvents[0]
    const party = venueEvents.some(event => event.isParty !== false)
    L.circleMarker([place.lat, place.lng], {
      radius: Math.min(14, 6 + venueEvents.length),
      color: '#0d0d0d',
      weight: 2,
      fillColor: party ? '#ffff07' : '#6c9cf0',
      fillOpacity: 0.9
    }).bindPopup(`<strong>${escape(venue || 'Venue')}</strong><br>${venueEvents.slice(0, 8)
      .map(event => `${clock.format(new Date(event.startsAt))} ${escape(event.title)}`).join('<br>')}${venueEvents.length > 8 ? `<br>+${venueEvents.length - 8} more` : ''}`)
      .addTo(layer)
  }
  if (here.value && !here.value.preview) {
    L.circleMarker([here.value.lat, here.value.lng], { radius: 7, color: '#ffffff', weight: 3, fillColor: '#ff7a6b', fillOpacity: 1 }).bindTooltip('You').addTo(layer)
  }
  if (radius.value) {
    L.circle([centre.value.lat, centre.value.lng], { radius: radius.value * 1000, color: '#ffff07', weight: 1, fillOpacity: 0.04, dashArray: '4 6' }).addTo(layer)
    map.fitBounds(L.latLng(centre.value.lat, centre.value.lng).toBounds(radius.value * 2000), { padding: [8, 8] })
  } else if (shown.value.length) {
    map.fitBounds(shown.value.map(item => [item.event.place.lat, item.event.place.lng]), { padding: [24, 24], maxZoom: 15 })
  } else {
    map.setView([centre.value.lat, centre.value.lng], 13)
  }
}

watch(when, async () => {
  await load()
  track('ade-map-window', { result: when.value })
})
watch([shown, radius, here], draw)

onMounted(async () => {
  track('ade-map-open', { result: duringAde ? 'live' : 'preview' })
  await load()
  await draw()
})
onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>
